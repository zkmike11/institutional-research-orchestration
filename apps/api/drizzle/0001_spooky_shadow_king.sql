CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"protocol_slug" text NOT NULL,
	"competitor_slug" text NOT NULL,
	"relationship" text,
	"data" jsonb,
	"last_compared" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conviction_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"conviction" text NOT NULL,
	"prob_thesis" real,
	"reason" text NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kill_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"criteria" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"monitoring_source" text,
	"check_frequency" text,
	"trigger_threshold" text,
	"last_checked" timestamp,
	"triggered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mental_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"applicability" text,
	"example" text,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"claim" text NOT NULL,
	"probability" real NOT NULL,
	"resolution_criteria" text,
	"check_date" date,
	"resolved_at" timestamp,
	"outcome" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sector" text,
	"chain_id" text,
	"defillama_id" text,
	"coingecko_id" text,
	"snapshot_space" text,
	"forum_url" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "protocols_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "search_vectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"chunk_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"max_allocation" real,
	"current_exposure" real DEFAULT 0,
	"protocol_count" integer DEFAULT 0,
	"metadata" jsonb,
	CONSTRAINT "sectors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "signposts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'intact' NOT NULL,
	"conviction_impact" integer,
	"last_checked" timestamp,
	"triggered_at" timestamp,
	"evidence" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid,
	"tool_name" text NOT NULL,
	"source" text NOT NULL,
	"success" boolean NOT NULL,
	"latency_ms" integer,
	"error_message" text,
	"response_size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "learnings" ADD COLUMN "confidence" real;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "sections" jsonb;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "is_demo" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "conviction_timeline" ADD CONSTRAINT "conviction_timeline_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kill_criteria" ADD CONSTRAINT "kill_criteria_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signposts" ADD CONSTRAINT "signposts_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE no action ON UPDATE no action;