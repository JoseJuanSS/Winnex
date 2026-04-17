import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const campaignTypeEnum = pgEnum("campaign_type", [
  "contest",
  "draw",
  "promotion",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "paused",
  "ended",
  "cancelled",
]);

export const campaignVisibilityEnum = pgEnum("campaign_visibility", [
  "public",
  "members_only",
  "premium_only",
  "hidden",
]);

export const prizeTypeEnum = pgEnum("prize_type", [
  "physical",
  "digital",
  "gift_card",
  "experience",
  "premium_access",
  "cash",
  "coupon",
]);

export const fulfillmentTypeEnum = pgEnum("fulfillment_type", [
  "automatic",
  "manual",
  "third_party",
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "claimed",
  "fulfilled",
  "expired",
  "disputed",
]);

export const drawMethodEnum = pgEnum("draw_method", [
  "random",
  "weighted_random",
  "admin_select",
]);

export const entrySourceEnum = pgEnum("entry_source", [
  "free",
  "points",
  "purchase",
  "subscription_perk",
  "referral_bonus",
]);

export const contestScoringEnum = pgEnum("contest_scoring", [
  "points",
  "time",
  "manual",
  "votes",
]);

export const submissionTypeEnum = pgEnum("submission_type", [
  "trivia",
  "text",
  "image",
  "link",
  "none",
]);

export const judgingTypeEnum = pgEnum("judging_type", [
  "automatic",
  "manual",
  "community_vote",
]);

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaigns = pgTable(
  "campaigns",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    campaignType: campaignTypeEnum("campaign_type").notNull(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    visibility: campaignVisibilityEnum("visibility")
      .notNull()
      .default("public"),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    rulesJson: jsonb("rules_json"),
    createdBy: text("created_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("campaigns_slug_idx").on(t.slug)]
);

// ─── Contests ─────────────────────────────────────────────────────────────────

export const contests = pgTable("contests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id")
    .notNull()
    .unique()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  scoringType: contestScoringEnum("scoring_type").notNull().default("points"),
  maxAttempts: integer("max_attempts").default(1),
  submissionType: submissionTypeEnum("submission_type")
    .notNull()
    .default("trivia"),
  judgingType: judgingTypeEnum("judging_type").notNull().default("automatic"),
  leaderboardEnabled: boolean("leaderboard_enabled").notNull().default(true),
  questionsJson: jsonb("questions_json"), // trivia questions array
});

export const contestEntries = pgTable(
  "contest_entries",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    contestId: text("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    submissionData: jsonb("submission_data"),
    score: integer("score").default(0),
    status: text("status").notNull().default("submitted"), // submitted | reviewed | rejected
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("contest_entries_contest_id_idx").on(t.contestId),
    index("contest_entries_user_id_idx").on(t.userId),
    index("contest_entries_score_idx").on(t.score),
  ]
);

// ─── Draws ────────────────────────────────────────────────────────────────────

export const draws = pgTable("draws", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id")
    .notNull()
    .unique()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  entryMode: entrySourceEnum("entry_mode").notNull().default("free"),
  requiresPermit: boolean("requires_permit").notNull().default(false), // legal flag
  maxEntriesPerUser: integer("max_entries_per_user").default(1),
  drawMethod: drawMethodEnum("draw_method").notNull().default("random"),
  winnerCount: integer("winner_count").notNull().default(1),
  pointsCostPerEntry: integer("points_cost_per_entry").default(0),
  drawAt: timestamp("draw_at"),
  drawnAt: timestamp("drawn_at"),
});

export const drawEntries = pgTable(
  "draw_entries",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    drawId: text("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entrySource: entrySourceEnum("entry_source").notNull().default("free"),
    pointsSpent: integer("points_spent").default(0),
    purchaseId: text("purchase_id"),
    isFreeEntry: boolean("is_free_entry").notNull().default(true),
    entryToken: text("entry_token").notNull().unique(),
    status: text("status").notNull().default("active"), // active | void
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("draw_entries_draw_user_idx").on(t.drawId, t.userId),
    index("draw_entries_draw_id_idx").on(t.drawId),
  ]
);

// ─── Prizes ───────────────────────────────────────────────────────────────────

export const prizes = pgTable("prizes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  prizeType: prizeTypeEnum("prize_type").notNull(),
  inventory: integer("inventory").notNull().default(1),
  estimatedValue: integer("estimated_value"), // in cents
  fulfillmentType: fulfillmentTypeEnum("fulfillment_type")
    .notNull()
    .default("manual"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Winners ──────────────────────────────────────────────────────────────────

export const winners = pgTable(
  "winners",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    prizeId: text("prize_id")
      .notNull()
      .references(() => prizes.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    sourceEntryId: text("source_entry_id"),
    selectedAt: timestamp("selected_at").notNull().defaultNow(),
    claimStatus: claimStatusEnum("claim_status").notNull().default("pending"),
    fulfilledAt: timestamp("fulfilled_at"),
    notes: text("notes"),
  },
  (t) => [index("winners_campaign_id_idx").on(t.campaignId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  contest: one(contests, {
    fields: [campaigns.id],
    references: [contests.campaignId],
  }),
  draw: one(draws, {
    fields: [campaigns.id],
    references: [draws.campaignId],
  }),
  prizes: many(prizes),
  winners: many(winners),
  createdByUser: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
}));

export const contestsRelations = relations(contests, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [contests.campaignId],
    references: [campaigns.id],
  }),
  entries: many(contestEntries),
}));

export const contestEntriesRelations = relations(contestEntries, ({ one }) => ({
  contest: one(contests, {
    fields: [contestEntries.contestId],
    references: [contests.id],
  }),
  user: one(users, {
    fields: [contestEntries.userId],
    references: [users.id],
  }),
}));

export const drawsRelations = relations(draws, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [draws.campaignId],
    references: [campaigns.id],
  }),
  entries: many(drawEntries),
}));

export const drawEntriesRelations = relations(drawEntries, ({ one }) => ({
  draw: one(draws, {
    fields: [drawEntries.drawId],
    references: [draws.id],
  }),
  user: one(users, {
    fields: [drawEntries.userId],
    references: [users.id],
  }),
}));

export const prizesRelations = relations(prizes, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [prizes.campaignId],
    references: [campaigns.id],
  }),
  winners: many(winners),
}));

export const winnersRelations = relations(winners, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [winners.campaignId],
    references: [campaigns.id],
  }),
  prize: one(prizes, {
    fields: [winners.prizeId],
    references: [prizes.id],
  }),
  user: one(users, {
    fields: [winners.userId],
    references: [users.id],
  }),
}));
