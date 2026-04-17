import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallets, pointLedger, userStreaks, userLevels } from "@/lib/db/schema";
import { redis } from "@/lib/redis";

export async function getWalletByUserId(userId: string) {
  return db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });
}

export async function getLedgerHistory(userId: string, limit = 20) {
  return db.query.pointLedger.findMany({
    where: eq(pointLedger.userId, userId),
    orderBy: [desc(pointLedger.createdAt)],
    limit,
  });
}

export async function getStreakByUserId(userId: string) {
  return db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId),
  });
}

export async function getLevelByUserId(userId: string) {
  return db.query.userLevels.findFirst({
    where: eq(userLevels.userId, userId),
  });
}

export async function canClaimToday(userId: string): Promise<boolean> {
  const claimed = await redis.get(`daily_claim:${userId}`);
  return !claimed;
}

export type LedgerEntry = Awaited<ReturnType<typeof getLedgerHistory>>[number];
export type WalletData = Awaited<ReturnType<typeof getWalletByUserId>>;
