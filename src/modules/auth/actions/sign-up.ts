"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, userProfiles, wallets, verificationTokens } from "@/lib/db/schema";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";
import { authRatelimit } from "@/lib/redis";
import { headers } from "next/headers";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

function generateReferralCode(username: string): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${username.slice(0, 4).toUpperCase()}${suffix}`;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  // ─── Rate limiting ──────────────────────────────────────────────────────
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(`signup:${ip}`);
  if (!allowed) {
    return { success: false, error: "Demasiados intentos. Intenta más tarde." };
  }

  // ─── Validación ─────────────────────────────────────────────────────────
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { email, username, password, displayName, referralCode } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // ─── Email único ────────────────────────────────────────────────────────
  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existingEmail) {
    return { success: false, error: "Este email ya está registrado." };
  }

  // ─── Username único ─────────────────────────────────────────────────────
  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (existingUsername) {
    return { success: false, error: "Este nombre de usuario no está disponible." };
  }

  // ─── Crear usuario ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    // 1. Usuario
    await tx.insert(users).values({
      id: userId,
      email: normalizedEmail,
      username,
      displayName: displayName ?? username,
      passwordHash,
      role: "user",
      status: "pending_verification",
    });

    // 2. Perfil
    await tx.insert(userProfiles).values({
      userId,
      referralCode: generateReferralCode(username),
    });

    // 3. Wallet vacío
    await tx.insert(wallets).values({ userId });

    // 4. Token de verificación (24h)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await tx.insert(verificationTokens).values({
      userId,
      token,
      type: "email_verify",
      expiresAt,
    });

    // 5. Email de verificación
    await sendVerificationEmail(normalizedEmail, token, displayName ?? username);
  });

  // ─── Referral (si aplica) ────────────────────────────────────────────────
  if (referralCode) {
    try {
      const { processReferral } = await import("@/modules/referrals/actions/process-referral");
      await processReferral(userId, referralCode);
    } catch {
      // Non-critical, no block signup
    }
  }

  return {
    success: true,
    message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
  };
}
