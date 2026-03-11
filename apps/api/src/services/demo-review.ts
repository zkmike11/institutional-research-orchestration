import { resolve } from "path";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { broadcastToolCall } from "../routes/reviews.js";

// Template uses {p} as placeholder for protocol name, {s} for snapshot space
const DEMO_TOOL_TEMPLATES: { name: string; args: string }[] = [
  // ── Step 0: Protocol Resolution ──────────────────────────
  { name: "resolve_protocol", args: "{p}" },
  { name: "search_memos", args: "{p}" },
  { name: "search_learnings", args: "{p}" },
  { name: "mental_model_lookup", args: "DeFi lending protocol valuation" },

  // ── Step 1: Intelligence Gathering (4 blocks) ────────────
  // Block A: Financial
  { name: "protocol_snapshot", args: "{p}" },
  { name: "revenue_data", args: "{p}" },
  { name: "fee_data", args: "{p}" },
  { name: "tvl_data", args: "{p}" },
  // Block B: Token
  { name: "token_price", args: "{p}" },
  { name: "token_info", args: "{p}" },
  { name: "market_data", args: "{p}" },
  { name: "token_unlocks", args: "{p}" },
  { name: "emissions_schedule", args: "{p}" },
  // Block C: Governance Recon
  { name: "detect_governance", args: "{p}" },
  { name: "search_spaces", args: "{p}" },
  { name: "governance_participation_trend", args: "{s}" },
  // Block D: Field Intel
  { name: "protocol_news", args: "{p}" },
  { name: "web_search", args: "{p} DeFi latest news 2026" },
  { name: "social_sentiment", args: "{p}" },
  { name: "forum_search", args: "governance.{p}.com, fees" },

  // ── GATE: Mandate Check ──────────────────────────────────
  { name: "fund_thesis", args: "" },
  { name: "get_mandate", args: "" },
  { name: "mandate_check", args: "{p}, 5" },

  // ── Step 2: Deep Dive (4 tracks) ─────────────────────────
  // Track 1: DeFi
  { name: "stablecoin_data", args: "{p}" },
  { name: "yield_data", args: "{p}" },
  { name: "yield_comparison", args: "lending" },
  { name: "compare_protocols", args: "{p}, aave, compound, spark" },
  { name: "liquidity_depth", args: "{p}" },
  { name: "fee_switch_analysis", args: "{p}" },
  // Track 2: Governance
  { name: "snapshot_proposals", args: "{s}, limit=20" },
  { name: "snapshot_voters", args: "{s}" },
  { name: "governance_health", args: "{s}" },
  { name: "voting_power", args: "{s}" },
  { name: "forum_posts", args: "governance.{p}.com" },
  { name: "governance_score", args: "{s}" },
  { name: "treasury_analysis", args: "{p}" },
  // Track 3: On-Chain
  { name: "contract_info", args: "0x...., ethereum" },
  { name: "contract_verified", args: "0x...., ethereum" },
  { name: "token_holders", args: "0x...., ethereum" },
  { name: "transaction_history", args: "0x...., limit=20" },
  { name: "token_transfers", args: "0x...., limit=20" },
  { name: "gas_usage", args: "0x...." },
  { name: "whale_tracking", args: "0x...., ethereum, 30d" },
  { name: "github_activity", args: "github.com/{p}/{p}-protocol" },
  // Track 4: Research
  { name: "audit_status", args: "{p}" },
  { name: "search_reports", args: "{p}" },
  { name: "protocol_list", args: "lending" },
  { name: "team_analysis", args: "{p}" },
  { name: "regulatory_scan", args: "{p}" },
  { name: "similar_protocols", args: "{p}" },

  // ── Step 3: Competitive Intelligence ─────────────────────
  { name: "competitor_analysis", args: "{p}, aave, compound" },
  { name: "valuation_multiples", args: "{p}" },
  { name: "sector_rotation_check", args: "lending" },

  // ── Step 4: Maturation Scoring ─────────────────────────
  { name: "historical_price_analysis", args: "{p}" },
  { name: "token_economics_model", args: "{p}" },

  // ── Step 5: Risk + Sizing ────────────────────────────────
  { name: "risk_score_calculation", args: "{p}" },
  { name: "correlation_analysis", args: "{p}" },
  { name: "data_confidence_score", args: "defillama, coingecko, snapshot" },
  { name: "get_portfolio", args: "" },
  { name: "sector_exposure_check", args: "lending" },
  { name: "portfolio_rebalance_check", args: "" },

  // ── Step 7: Report + Counter-Thesis Assembly ─────────────
  { name: "thesis_validation", args: "report_id" },
  { name: "prediction_track", args: "report_id, fee_switch_activation, 0.65" },

  // ── Step 8: Committee Decision + Post-Processing ────────
  { name: "charlies_take", args: "report_id" },
  { name: "signpost_extraction", args: "report_id" },
  { name: "telemetry_log", args: "review_complete, true, 0" },
];

function buildToolCalls(protocolName: string) {
  const p = protocolName.toLowerCase();
  const s = `${p}.eth`;
  return DEMO_TOOL_TEMPLATES.map(({ name, args }) => ({
    name,
    args: args.replace(/\{p\}/g, p).replace(/\{s\}/g, s),
  }));
}

function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runDemoReview(reviewId: string, protocolName: string, _notes?: string) {
  await db
    .update(schema.reviews)
    .set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(schema.reviews.id, reviewId));

  const toolCallLog: any[] = [];

  try {
    const demoToolCalls = buildToolCalls(protocolName);
    for (let i = 0; i < demoToolCalls.length; i++) {
      const { name, args } = demoToolCalls[i];
      const index = i + 1;

      // Broadcast "running" state
      broadcastToolCall(reviewId, {
        type: "tool_call",
        index,
        name,
        args,
        status: "running",
      });

      // Simulate latency
      await randomDelay(200, 600);

      const latency = Math.floor(Math.random() * 400) + 100;
      const entry = { name, args, status: "complete", latency_ms: latency };
      toolCallLog.push(entry);

      // Broadcast "complete" state
      broadcastToolCall(reviewId, { type: "tool_complete", index, ...entry });

      // Update DB every 5 calls
      if (index % 5 === 0) {
        await db
          .update(schema.reviews)
          .set({ toolCalls: toolCallLog })
          .where(eq(schema.reviews.id, reviewId));
      }
    }

    // Reuse existing demo report if one exists (prevents duplicate Morpho entries)
    const [existingDemo] = await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.isDemo, true))
      .limit(1);

    let report;
    if (existingDemo) {
      report = existingDemo;
    } else {
      // Load the Morpho memo as demo content (always Morpho — it's a demo)
      const dataDir = resolve(import.meta.dir, "../../data");
      const memoFile = Bun.file(resolve(dataDir, "ff14b47b-727d-403e-92f2-35b241e20fa0-memo.md"));
      const memoText = await memoFile.text();

      const recommendation = memoText.match(/Recommendation:\s*(BUY|WATCH|HOLD|REDUCE|EXIT)/i)?.[1]?.toUpperCase() || "WATCH";
      const conviction = memoText.match(/Conviction:\s*(LOW|MEDIUM|HIGH)/i)?.[1]?.toUpperCase() || "MEDIUM";
      const phaseMatch = memoText.match(/Phase\s*(\d)/i);
      const activismMatch = memoText.match(/Activism\s*[Ss]core[:\s]*(\d+)/i);
      const positionMatch = memoText.match(/Position\s*[Ss]ize[:\s]*([^\n]+)/i);

      [report] = await db
        .insert(schema.reports)
        .values({
          protocolName: "Morpho",
          recommendation,
          conviction,
          maturationPhase: phaseMatch ? `Phase ${phaseMatch[1]}` : null,
          activismScore: activismMatch ? parseInt(activismMatch[1]) : null,
          positionSize: positionMatch ? positionMatch[1].trim() : "",
          content: { raw: memoText },
          toolCallsCount: demoToolCalls.length,
          isDemo: true,
        })
        .returning();
    }

    await db
      .update(schema.reviews)
      .set({
        status: "complete",
        completedAt: new Date().toISOString(),
        toolCalls: toolCallLog,
        reportId: report.id,
      })
      .where(eq(schema.reviews.id, reviewId));

    broadcastToolCall(reviewId, { type: "complete", tool_calls_count: demoToolCalls.length });
  } catch (error: any) {
    console.error("Demo review failed:", error);
    await db
      .update(schema.reviews)
      .set({ status: "failed", toolCalls: toolCallLog })
      .where(eq(schema.reviews.id, reviewId));

    broadcastToolCall(reviewId, { type: "error", message: error.message });
  }
}
