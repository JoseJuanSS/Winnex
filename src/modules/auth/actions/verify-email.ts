"use server";

import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  if (!token) return { success: false, error: "Token inválido." };

  const record = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.token, token),
      eq(verificationTokens.type, "email_verify"),
      isNull(verificationTokens.usedAt),
      gt(verificationTokens.expiresAt, new Date())
    ),
  });

  if (!record) {
    return { success: false, error: "El enlace es inválido o ya expiró." };
  }

  await db.transaction(async (tx) => {
    // Marcar token como usado
    await tx
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, record.id));

    // Activar usuario
    await tx
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, record.userId));
  });

  return { success: true };
}
