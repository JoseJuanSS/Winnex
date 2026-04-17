"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles, referrals } from "@/lib/db/schema";

export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
  const referrerProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.referralCode, referralCode.toUpperCase()),
  });

  if (!referrerProfile || referrerProfile.userId === newUserId) return;

  // Anti-duplicate: check pair doesn't already exist
  const existing = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referrerUserId, referrerProfile.userId),
      eq(referrals.referredUserId, newUserId)
    ),
  });

  if (existing) return;

  await db.insert(referrals).values({
    referrerUserId: referrerProfile.userId,
    referredUserId: newUserId,
    status: "pending",
  });
}
