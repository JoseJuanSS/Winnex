import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contestEntries } from "@/lib/db/schema";
import { redis, cacheKeys } from "@/lib/redis";

export async function getContestLeaderboard(contestId: string, limit = 10) {
  const cacheKey = cacheKeys.leaderboard(contestId);

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // Query database
  const entries = await db.query.contestEntries.findMany({
    where: eq(contestEntries.contestId, contestId),
    orderBy: [desc(contestEntries.score), desc(contestEntries.createdAt)],
    limit,
    with: {
      user: {
        columns: { id: true, displayName: true, username: true, avatarUrl: true },
      },
    },
  });

  const leaderboard = entries.map((entry: typeof entries[0], index: number) => ({
    rank: index + 1,
    userId: entry.userId,
    displayName: entry.user?.displayName ?? "Anónimo",
    username: entry.user?.username ?? "unknown",
    avatarUrl: entry.user?.avatarUrl ?? null,
    score: entry.score ?? 0,
  }));

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(leaderboard), { ex: 300 });

  return leaderboard;
}

export async function getUserLeaderboardRank(contestId: string, userId: string) {
  const leaderboard = await getContestLeaderboard(contestId, 1000);
  const rank = leaderboard.findIndex((entry: { userId: string }) => entry.userId === userId) + 1;
  return rank || null;
}

export async function invalidateLeaderboardCache(contestId: string) {
  const cacheKey = cacheKeys.leaderboard(contestId);
  await redis.del(cacheKey);
}

export type LeaderboardEntry = Awaited<
  ReturnType<typeof getContestLeaderboard>
>[number];
