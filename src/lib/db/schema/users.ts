import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "moderator",
  "admin",
  "super_admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
  "pending_verification",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    username: text("username").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("user"),
    status: userStatusEnum("status").notNull().default("pending_verification"),
    countryCode: text("country_code"),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_username_idx").on(t.username),
  ]
);

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  birthDate: timestamp("birth_date"),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  referralCode: text("referral_code").unique(),
  trustScore: real("trust_score").notNull().default(100),
});

// ─── Verification Tokens ──────────────────────────────────────────────────────

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    type: text("type").notNull(), // "email_verify" | "password_reset"
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("verification_tokens_token_idx").on(t.token)]
);

// ─── Sessions / Devices (anti-fraud) ─────────────────────────────────────────

export const userSessions = pgTable(
  "user_sessions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceHash: text("device_hash"),
    ipHash: text("ip_hash"),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    riskScore: real("risk_score").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("user_sessions_user_id_idx").on(t.userId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(userSessions),
  verificationTokens: many(verificationTokens),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
