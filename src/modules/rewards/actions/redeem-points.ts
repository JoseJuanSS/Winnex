"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallets, pointLedger, prizes } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";

type RedeemResult =
  | { success: true; message: string; balanceRemaining: number }
  | { success: false; error: string };

export async function redeemPointsAction(
  prizeId: string,
  quantity: number = 1
): Promise<RedeemResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  if (quantity < 1) {
    return { success: false, error: "La cantidad debe ser mayor a 0." };
  }

  // Get prize
  const prize = await db.query.prizes.findFirst({
    where: eq(prizes.id, prizeId),
  });

  if (!prize) {
    return { success: false, error: "El premio no existe." };
  }

  // Check inventory
  if (prize.inventory < quantity) {
    return {
      success: false,
      error: `No hay suficiente inventario. Disponible: ${prize.inventory}`,
    };
  }

  // Get wallet
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  if (!wallet) {
    return { success: false, error: "Tu wallet no existe." };
  }

  // Calculate cost
  const estimatedValueInPoints = Math.ceil((prize.estimatedValue ?? 0) / 100); // Assume 1 point = $0.01
  const totalCost = estimatedValueInPoints * quantity;

  if (wallet.pointsBalance < totalCost) {
    return {
      success: false,
      error: `Necesitas ${totalCost} puntos. Tienes ${wallet.pointsBalance}.`,
    };
  }

  // Process redemption
  const now = new Date();

  await db.transaction(async (tx) => {
    // 1. Ledger entry
    await tx.insert(pointLedger).values({
      userId,
      type: "redemption",
      amount: totalCost,
      direction: "debit",
      reason: `Canje de ${prize.title} (x${quantity})`,
      referenceType: "prize",
      referenceId: prizeId,
    });

    // 2. Update wallet
    await tx
      .update(wallets)
      .set({
        pointsBalance: wallet.pointsBalance - totalCost,
        lifetimePointsSpent: wallet.lifetimePointsSpent + totalCost,
        updatedAt: now,
      })
      .where(eq(wallets.userId, userId));

    // 3. Decrease prize inventory (optional if finite)
    await tx
      .update(prizes)
      .set({})
      .where(eq(prizes.id, prizeId));
  });

  return {
    success: true,
    message: `¡Canjeaste ${prize.title}! Te enviaremos el premio a tu email.`,
    balanceRemaining: wallet.pointsBalance - totalCost,
  };
}
