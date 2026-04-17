import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Upstash Redis environment variables are not set");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ─── Rate limiters ────────────────────────────────────────────────────────────

/** Auth endpoints: 10 requests per 10 minutes per IP */
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

/** API general: 100 requests per minute */
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

/** Participation: 5 entries per minute per user */
export const participationRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:participation",
});

// ─── Cache keys ───────────────────────────────────────────────────────────────

export const cacheKeys = {
  leaderboard: (contestId: string) => `leaderboard:${contestId}`,
  campaignList: () => "campaigns:active",
  userWallet: (userId: string) => `wallet:${userId}`,
  featureFlags: () => "feature_flags",
} as const;
