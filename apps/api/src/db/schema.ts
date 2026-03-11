import { pgTable, uuid, text, integer, decimal, date, timestamp, jsonb, boolean, real, index } from "drizzle-orm/pg-core";

// ═══════════════════════════════════════
// Core tables (original 6)
// ═══════════════════════════════════════

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolName: text("protocol_name").notNull(),
  recommendation: text("recommendation").notNull(),
  conviction: text("conviction").notNull(),
  maturationPhase: text("maturation_phase"),
  activismScore: integer("activism_score"),
  positionSize: text("position_size"),
  content: jsonb("content").notNull(),
  sections: jsonb("sections"), // 24-section structured JSONB
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
  confidence: real("confidence"), // 0.0-1.0
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

// ═══════════════════════════════════════
// New tables (10 additional, total 16)
// ═══════════════════════════════════════

export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id).notNull(),
  claim: text("claim").notNull(),
  probability: real("probability").notNull(), // 0.0-1.0
  resolutionCriteria: text("resolution_criteria"),
  checkDate: date("check_date"),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
  outcome: text("outcome"), // "correct" | "incorrect" | "ambiguous"
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const signposts = pgTable("signposts", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id).notNull(),
  description: text("description").notNull(),
  status: text("status").default("intact").notNull(), // intact | at_risk | triggered
  convictionImpact: integer("conviction_impact"), // e.g. -1, +1, -2
  lastChecked: timestamp("last_checked", { mode: "string" }),
  triggeredAt: timestamp("triggered_at", { mode: "string" }),
  evidence: text("evidence"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const convictionTimeline = pgTable("conviction_timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id).notNull(),
  conviction: text("conviction").notNull(), // LOW | MEDIUM | HIGH
  probThesis: real("prob_thesis"), // Bayesian P(thesis), 0.0-1.0
  reason: text("reason").notNull(),
  source: text("source"), // "signpost" | "manual" | "re-review" | "market"
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const killCriteria = pgTable("kill_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id).notNull(),
  criteria: text("criteria").notNull(),
  status: text("status").default("active").notNull(), // active | triggered | retired
  monitoringSource: text("monitoring_source"),
  checkFrequency: text("check_frequency"), // "weekly" | "monthly" | "daily"
  triggerThreshold: text("trigger_threshold"),
  lastChecked: timestamp("last_checked", { mode: "string" }),
  triggeredAt: timestamp("triggered_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const protocols = pgTable("protocols", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  sector: text("sector"),
  chainId: text("chain_id"),
  defiLlamaId: text("defillama_id"),
  coingeckoId: text("coingecko_id"),
  snapshotSpace: text("snapshot_space"),
  forumUrl: text("forum_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const sectors = pgTable("sectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  maxAllocation: real("max_allocation"), // max % of NAV
  currentExposure: real("current_exposure").default(0),
  protocolCount: integer("protocol_count").default(0),
  metadata: jsonb("metadata"),
});

export const mentalModels = pgTable("mental_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "finance" | "economics" | "psychology" | "systems" | "biology" etc.
  description: text("description").notNull(),
  applicability: text("applicability"), // when to use this model
  example: text("example"), // example application
  source: text("source"), // "Munger" | "Theia" | "Custom"
});

export const telemetry = pgTable("telemetry", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id").references(() => reviews.id),
  toolName: text("tool_name").notNull(),
  source: text("source").notNull(), // "defillama" | "coingecko" | "snapshot" etc.
  success: boolean("success").notNull(),
  latencyMs: integer("latency_ms"),
  errorMessage: text("error_message"),
  responseSize: integer("response_size"), // bytes
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  protocolSlug: text("protocol_slug").notNull(),
  competitorSlug: text("competitor_slug").notNull(),
  relationship: text("relationship"), // "direct" | "indirect" | "adjacent"
  data: jsonb("data"), // cached comparison data
  lastCompared: timestamp("last_compared", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

// Note: searchVectors table requires pgvector extension.
// For now, we define the table structure without the vector column.
// The vector column will be added via raw SQL migration when pgvector is enabled.
export const searchVectors = pgTable("search_vectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentType: text("content_type").notNull(), // "report" | "learning" | "fund_context"
  contentId: uuid("content_id").notNull(),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").default(0),
  // embedding vector(1536) - added via migration with pgvector
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});
