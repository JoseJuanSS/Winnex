/* eslint-disable @typescript-eslint/no-explicit-any */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userBadges, badges } from "@/lib/db/schema";

export async function getUserBadges(userId: string) {
  return db.query.userBadges.findMany({
    where: eq(userBadges.userId, userId),
    with: {
      badge: true,
    },
    orderBy: [],
  });
}

export async function getBadgeBySlug(slug: string) {
  return db.query.badges.findFirst({
    where: eq(badges.slug, slug),
  });
}

export async function getAllBadges() {
  return db.query.badges.findMany();
}

export async function hasBadge(userId: string, badgeSlug: string): Promise<boolean> {
  const records = await db.query.userBadges.findMany({
    where: eq(userBadges.userId, userId),
    with: {
      badge: true,
    },
  });

  return records.some((record) => (record.badge as any)?.slug === badgeSlug);
}

export type UserBadgeWithDetails = Awaited<ReturnType<typeof getUserBadges>>[number];
