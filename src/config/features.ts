/**
 * Feature flags default values.
 * Runtime values are stored in the DB (feature_flags table) and
 * cached in Redis. This file provides safe compile-time defaults.
 *
 * A mechanic set to `false` is completely disabled and will NOT
 * expose any illegal or unintended behavior.
 */

export const DEFAULT_FEATURES = {
  /** Core — always on */
  contests_enabled: true,
  points_enabled: true,
  referrals_enabled: true,

  /** Phase 2 */
  badges_enabled: false,
  streaks_enabled: false,
  leaderboard_public: false,

  /** Phase 3 — Monetization */
  subscriptions_enabled: false,
  checkout_enabled: false,

  /** Phase 4 — Sweepstakes (requires legal permit) */
  draws_enabled: false,
  paid_entries_enabled: false,
} as const;

export type FeatureKey = keyof typeof DEFAULT_FEATURES;
