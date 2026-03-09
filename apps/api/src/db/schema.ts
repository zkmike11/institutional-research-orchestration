import { pgTable, uuid, text, integer, decimal, date, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolName: text("protocol_name").notNull(),
  recommendation: text("recommendation").notNull(),
  conviction: text("conviction").notNull(),
  maturationPhase: text("maturation_phase"),
  activismScore: integer("activism_score"),
  positionSize: text("position_size"),
  content: jsonb("content").notNull(),
  toolCallsCount: integer("tool_calls_count").default(0),
  dataCompleteness: jsonb("data_completeness"),
  isDemo: boolean("is_demo").default(false),
  version: integer("version").default(1),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const learnings = pgTable("learnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  protocol: text("protocol"),
  source: text("source"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const portfolio = pgTable("portfolio", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolName: text("protocol_name").notNull(),
  positionSizePct: decimal("position_size_pct"),
  sector: text("sector").notNull(),
  entryDate: date("entry_date"),
  currentStatus: text("current_status"),
  lastReviewId: uuid("last_review_id").references(() => reports.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolName: text("protocol_name").notNull(),
  notes: text("notes"),
  status: text("status").default("pending"),
  toolCalls: jsonb("tool_calls").default([]),
  reportId: uuid("report_id").references(() => reports.id),
  startedAt: timestamp("started_at", { mode: "string" }),
  completedAt: timestamp("completed_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const toolCallLogs = pgTable("tool_call_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id").references(() => reviews.id),
  source: text("source").notNull(),
  toolName: text("tool_name").notNull(),
  success: boolean("success").notNull(),
  latencyMs: integer("latency_ms"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const fundConfig = pgTable("fund_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
});
