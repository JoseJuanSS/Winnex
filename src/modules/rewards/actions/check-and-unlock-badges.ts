"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { badges, userBadges, wallets, userStreaks, contestEntries, users } from "@/lib/db/schema";

/** Badge unlock rules (skill-based, no randomness) */
export const BADGE_RULES: Record<
  string,
  (userId: string) => Promise<boolean>
> = {
  first_points: async (userId) => {
    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });
    return (wallet?.lifetimePointsEarned ?? 0) >= 50;
  },

  streak_3: async (userId) => {
    const streak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId),
    });
    return (streak?.currentStreak ?? 0) >= 3;
  },

  streak_7: async (userId) => {
    const streak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId),
    });
    return (streak?.currentStreak ?? 0) >= 7;
  },

  earned_500_points: async (userId) => {
    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });
    return (wallet?.lifetimePointsEarned ?? 0) >= 500;
  },

  contest_veteran: async (userId) => {
    const entries = await db.query.contestEntries.findMany({
      where: eq(contestEntries.userId, userId),
      limit: 1,
    });
    return entries.length >= 5;
  },

  early_adopter: async (userId) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) return false;
    // Unlocked if account created within first 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return user.createdAt > thirtyDaysAgo;
  },
};

export async function checkAndUnlockBadgesAction(userId: string): Promise<string[]> {
  const unlockedBadgeSlugs: string[] = [];

  for (const [slug, checkFn] of Object.entries(BADGE_RULES)) {
    try {
      const hasUnlocked = await checkFn(userId);
      if (!hasUnlocked) continue;

      // Check if already has badge
      const existing = await db.query.userBadges.findFirst({
        where: eq(userBadges.userId, userId),
      });

      if (existing) continue;

      // Unlock badge
      const badge = await db.query.badges.findFirst({
        where: eq(badges.slug, slug),
      });

      if (!badge) continue;

      await db.insert(userBadges).values({
        userId,
        badgeId: badge.id,
      });

      unlockedBadgeSlugs.push(slug);
    } catch {
      // Non-critical, continue
    }
  }

  return unlockedBadgeSlugs;
}
