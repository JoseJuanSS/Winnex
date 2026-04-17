import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ledgerDirectionEnum = pgEnum("ledger_direction", [
  "credit",
  "debit",
]);

export const ledgerTypeEnum = pgEnum("ledger_type", [
  "daily_login",
  "contest_entry",
  "contest_win",
  "referral_bonus",
  "purchase_bonus",
  "subscription_bonus",
  "streak_bonus",
  "admin_adjustment",
  "redemption",
  "expiry",
]);

// ─── Wallets ──────────────────────────────────────────────────────────────────

export const wallets = pgTable("wallets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  pointsBalance: integer("points_balance").notNull().default(0),
  lockedPoints: integer("locked_points").notNull().default(0),
  lifetimePointsEarned: integer("lifetime_points_earned").notNull().default(0),
  lifetimePointsSpent: integer("lifetime_points_spent").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Point Ledger ─────────────────────────────────────────────────────────────

export const pointLedger = pgTable(
  "point_ledger",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: ledgerTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    direction: ledgerDirectionEnum("direction").notNull(),
    reason: text("reason"),
    referenceType: text("reference_type"), // "contest_entry" | "order" | etc.
    referenceId: text("reference_id"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("point_ledger_user_id_created_at_idx").on(t.userId, t.createdAt),
    index("point_ledger_user_id_idx").on(t.userId),
  ]
);

// ─── Badges ───────────────────────────────────────────────────────────────────

export const badges = pgTable("badges", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  requirement: text("requirement"), // JSON rule descriptor
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp("earned_at").notNull().defaultNow(),
  },
  (t) => [index("user_badges_user_id_idx").on(t.userId)]
);

// ─── Streaks ──────────────────────────────────────────────────────────────────

export const userStreaks = pgTable("user_streaks", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastClaimedAt: timestamp("last_claimed_at"),
  streakFrozenUntil: timestamp("streak_frozen_until"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── User XP / Levels ─────────────────────────────────────────────────────────

export const userLevels = pgTable("user_levels", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  ledgerEntries: many(pointLedger),
}));

export const pointLedgerRelations = relations(pointLedger, ({ one }) => ({
  user: one(users, { fields: [pointLedger.userId], references: [users.id] }),
}));
