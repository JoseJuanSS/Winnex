import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]);

export const planIntervalEnum = pgEnum("plan_interval", [
  "month",
  "year",
  "week",
  "lifetime",
]);

export const productTypeEnum = pgEnum("product_type", [
  "subscription",
  "one_time",
  "bundle",
  "draw_entry_pack",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
  "partially_refunded",
]);

// ─── Plans ────────────────────────────────────────────────────────────────────

export const plans = pgTable(
  "plans",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    price: integer("price").notNull(), // in cents
    currency: text("currency").notNull().default("usd"),
    interval: planIntervalEnum("interval").notNull().default("month"),
    benefitsJson: jsonb("benefits_json"), // list of perks
    status: text("status").notNull().default("active"), // active | archived
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("plans_slug_idx").on(t.slug)]
);

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    provider: text("provider").notNull().default("stripe"),
    providerSubscriptionId: text("provider_subscription_id").unique(),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("subscriptions_user_id_idx").on(t.userId)]
);

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    productType: productTypeEnum("product_type").notNull(),
    price: integer("price").notNull(), // in cents
    currency: text("currency").notNull().default("usd"),
    status: text("status").notNull().default("active"),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug)]
);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: integer("subtotal").notNull(), // in cents
    total: integer("total").notNull(), // in cents
    currency: text("currency").notNull().default("usd"),
    provider: text("provider"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("orders_user_id_idx").on(t.userId)]
);

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  metadataJson: jsonb("metadata_json"),
});

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("usd"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    paidAt: timestamp("paid_at"),
    rawJson: jsonb("raw_json"), // raw webhook payload
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_provider_payment_id_idx").on(t.providerPaymentId),
    index("payments_user_id_idx").on(t.userId),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));
