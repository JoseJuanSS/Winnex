import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(), // e.g. "campaign.created", "user.banned"
    entityType: text("entity_type"), // e.g. "campaign", "user", "draw"
    entityId: text("entity_id"),
    payloadJson: jsonb("payload_json"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorUserId),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ]
);

// ─── Feature Flags ────────────────────────────────────────────────────────────
// Controla qué mecánicas están activas sin tocar código

export const featureFlags = pgTable("feature_flags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),   // e.g. "draws_enabled", "subscriptions_enabled"
  enabled: text("enabled").notNull().default("false"),
  description: text("description"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));
