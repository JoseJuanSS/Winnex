import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const referralStatusEnum = pgEnum("referral_status", [
  "pending",
  "activated",
  "rewarded",
  "voided",
]);

export const referralRewardTypeEnum = pgEnum("referral_reward_type", [
  "points",
  "draw_entries",
  "premium_trial",
  "cash",
]);

export const referralRewardStatusEnum = pgEnum("referral_reward_status", [
  "pending",
  "granted",
  "failed",
]);

// ─── Referrals ────────────────────────────────────────────────────────────────

export const referrals = pgTable(
  "referrals",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    referrerUserId: text("referrer_user_id")
      .notNull()
      .references(() => users.id),
    referredUserId: text("referred_user_id")
      .notNull()
      .references(() => users.id),
    status: referralStatusEnum("status").notNull().default("pending"),
    rewardGrantedAt: timestamp("reward_granted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("referrals_pair_idx").on(t.referrerUserId, t.referredUserId),
    index("referrals_referrer_idx").on(t.referrerUserId),
  ]
);

// ─── Referral Rewards ─────────────────────────────────────────────────────────

export const referralRewards = pgTable("referral_rewards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referralId: text("referral_id")
    .notNull()
    .references(() => referrals.id, { onDelete: "cascade" }),
  beneficiaryUserId: text("beneficiary_user_id")
    .notNull()
    .references(() => users.id),
  rewardType: referralRewardTypeEnum("reward_type").notNull().default("points"),
  amount: integer("amount").notNull(),
  rewardStatus: referralRewardStatusEnum("reward_status")
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerUserId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
  rewards: many(referralRewards),
}));

export const referralRewardsRelations = relations(
  referralRewards,
  ({ one }) => ({
    referral: one(referrals, {
      fields: [referralRewards.referralId],
      references: [referrals.id],
    }),
    beneficiary: one(users, {
      fields: [referralRewards.beneficiaryUserId],
      references: [users.id],
    }),
  })
);
