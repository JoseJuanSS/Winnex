"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallets, pointLedger, userStreaks } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { redis } from "@/lib/redis";

const DAILY_POINTS = 50;
const STREAK_BONUS_MULTIPLIER = 0.1; // +10% per streak day, cap at 2x

type ClaimResult =
  | { success: true; pointsEarned: number; newBalance: number; streak: number; isBonus: boolean }
  | { success: false; error: string; nextClaimAt?: Date };

export async function dailyClaimAction(): Promise<ClaimResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  // ─── Prevent double-claim via Redis (TTL until midnight) ─────────────────
  const claimKey = `daily_claim:${userId}`;
  const alreadyClaimed = await redis.get(claimKey);
  if (alreadyClaimed) {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return {
      success: false,
      error: "Ya reclamaste tus puntos hoy.",
      nextClaimAt: midnight,
    };
  }

  // ─── Load streak ──────────────────────────────────────────────────────────
  const streak = await db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId),
  });

  const yesterday = new Date();
  const now = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (streak?.lastClaimedAt) {
    const lastDate = new Date(streak.lastClaimedAt);
    const isConsecutive =
      lastDate.toDateString() === yesterday.toDateString();
    newStreak = isConsecutive ? (streak.currentStreak ?? 0) + 1 : 1;
  }

  // ─── Calculate points ─────────────────────────────────────────────────────
  const streakDays = Math.min(newStreak - 1, 10); // cap bonus at 10 days
  const multiplier = 1 + streakDays * STREAK_BONUS_MULTIPLIER;
  const pointsEarned = Math.round(DAILY_POINTS * multiplier);
  const isBonus = newStreak > 1;

  await db.transaction(async (tx) => {
    // 1. Upsert streak
    if (!streak) {
      await tx.insert(userStreaks).values({
        userId,
        currentStreak: newStreak,
        longestStreak: newStreak,
        lastClaimedAt: now,
      });
    } else {
      await tx
        .update(userStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastClaimedAt: now,
          updatedAt: now,
        })
        .where(eq(userStreaks.userId, userId));
    }

    // 2. Ledger entry
    await tx.insert(pointLedger).values({
      userId,
      type: newStreak > 1 ? "streak_bonus" : "daily_login",
      amount: pointsEarned,
      direction: "credit",
      reason: `Daily claim — día ${newStreak}`,
    });

    // 3. Update wallet
    const wallet = await tx.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });
    if (wallet) {
      await tx
        .update(wallets)
        .set({
          pointsBalance: wallet.pointsBalance + pointsEarned,
          lifetimePointsEarned: wallet.lifetimePointsEarned + pointsEarned,
          updatedAt: now,
        })
        .where(eq(wallets.userId, userId));
    }
  });

  // ─── Set Redis lock until midnight ────────────────────────────────────────
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
  await redis.set(claimKey, "1", { ex: ttl });

  // Reload wallet balance
  const updatedWallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  return {
    success: true,
    pointsEarned,
    newBalance: updatedWallet?.pointsBalance ?? 0,
    streak: newStreak,
    isBonus,
  };
}
