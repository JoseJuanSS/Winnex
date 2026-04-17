"use server";

import { eq, and, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { authRatelimit } from "@/lib/redis";
import { headers } from "next/headers";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  type PasswordResetInput,
  type PasswordResetRequestInput,
} from "@/lib/validations/auth";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function requestPasswordResetAction(
  input: PasswordResetRequestInput
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await authRatelimit.limit(`reset:${ip}`);
  if (!allowed) {
    return { success: false, error: "Demasiados intentos. Intenta más tarde." };
  }

  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Email inválido." };

  const { email } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  // Security: always return success even if user not found (prevent enumeration)
  if (!user) {
    return {
      success: true,
      message: "Si el email existe, recibirás un enlace de recuperación.",
    };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    type: "password_reset",
    expiresAt,
  });

  await sendPasswordResetEmail(email, token);

  return {
    success: true,
    message: "Si el email existe, recibirás un enlace de recuperación.",
  };
}

export async function resetPasswordAction(
  input: PasswordResetInput
): Promise<ActionResult> {
  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { success: false, error: firstError };
  }

  const { token, password } = parsed.data;

  const record = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.token, token),
      eq(verificationTokens.type, "password_reset"),
      isNull(verificationTokens.usedAt),
      gt(verificationTokens.expiresAt, new Date())
    ),
  });

  if (!record) {
    return { success: false, error: "El enlace es inválido o ya expiró." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.transaction(async (tx) => {
    await tx
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, record.id));

    await tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, record.userId));
  });

  return { success: true, message: "Contraseña actualizada correctamente." };
}
