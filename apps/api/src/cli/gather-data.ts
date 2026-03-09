#!/usr/bin/env bun
/**
 * CLI tool to gather all data for a protocol review.
 * Calls all free APIs (DefiLlama, CoinGecko, Snapshot, Discourse, Etherscan)
 * and saves the raw data package + creates a review record in the DB.
 *
 * Usage: bun run apps/api/src/cli/gather-data.ts "Aave" ["optional notes"]
 *
 * After this runs, Claude Code processes the data and generates the memo.
 */

import { eq } from "drizzle-orm";
import { executeTool } from "../services/tool-executor.js";
import { db, schema } from "../db/index.js";

const protocolName = process.argv[2];
const notes = process.argv[3] || "";

if (!protocolName) {
  console.error("Usage: bun run apps/api/src/cli/gather-data.ts <protocol_name> [notes]");
  process.exit(1);
}

console.log(`\nGathering data for: ${protocolName}\n`);

interface ToolResult {
  name: string;
  args: Record<string, any>;
  success: boolean;
  data: any;
  latencyMs: number;
  source: string;
}

const results: ToolResult[] = [];

async function callTool(name: string, args: Record<string, any>, source: string): Promise<any> {
  const start = Date.now();
  try {
    const data = await executeTool(name, args);
    const latency = Date.now() - start;
    results.push({ name, args, success: true, data, latencyMs: latency, source });
    console.log(`  [OK] ${name}(${Object.values(args).filter(Boolean).join(", ")}) - ${latency}ms`);
    return data;
  } catch (error: any) {
    const latency = Date.now() - start;
    results.push({ name, args, success: false, data: { error: error.message }, latencyMs: latency, source });
    console.log(`  [FAIL] ${name}(${Object.values(args).filter(Boolean).join(", ")}) - ${error.message}`);
    return null;
  }
}

// Create review record
const [review] = await db
  .insert(schema.reviews)
  .values({
    protocolName,
    notes: notes || null,
    status: "running",
    toolCalls: [],
    startedAt: new Date().toISOString(),
  })
  .returning();

console.log(`Review ID: ${review.id}\n`);

try {
  // Step 1: Resolve & Context
  console.log("Step 1: Resolve & context");
  const resolved = await callTool("resolve_protocol", { protocol_name: protocolName }, "defillama");
  await callTool("search_memos", { query: protocolName }, "internal");
  await callTool("search_learnings", { query: protocolName }, "internal");
  await callTool("fund_thesis", {}, "internal");
  await callTool("get_mandate", {}, "internal");

  // Extract IDs from resolution
  const defillamaSlug = resolved?.defillama?.slug || protocolName.toLowerCase();
  const coingeckoId = resolved?.coingecko?.[0]?.id || protocolName.toLowerCase();

  // Step 2: Data Gathering
  console.log("\nStep 2: Data gathering");
  await callTool("protocol_snapshot", { protocol_id: defillamaSlug }, "defillama");
  await callTool("revenue_data", { protocol_id: defillamaSlug }, "defillama");
  await callTool("token_price", { token_id: coingeckoId }, "coingecko");
  await callTool("token_info", { token_id: coingeckoId }, "coingecko");
  await callTool("fee_data", { protocol_id: defillamaSlug }, "defillama");
  await callTool("tvl_data", { protocol_id: defillamaSlug }, "defillama");
  await callTool("market_data", { token_id: coingeckoId }, "coingecko");
  await callTool("valuation_multiples", { protocol_id: defillamaSlug, coingecko_id: coingeckoId }, "defillama");
  await callTool("token_unlocks", { token_id: coingeckoId }, "coingecko");
  await callTool("dex_volume", { protocol_id: defillamaSlug }, "defillama");
  await callTool("yield_data", { protocol_id: defillamaSlug }, "defillama");
  await callTool("stablecoin_data", { protocol_id: defillamaSlug }, "defillama");

  // Step 3: Governance & Community
  console.log("\nStep 3: Governance & community");
  const governance = await callTool("detect_governance", { protocol_name: protocolName }, "snapshot");
  const spacesResult = await callTool("search_spaces", { query: protocolName }, "snapshot");
  const spaceId = spacesResult?.spaces?.[0]?.id || `${protocolName.toLowerCase()}.eth`;

  await callTool("snapshot_proposals", { space_id: spaceId, limit: 10 }, "snapshot");
  await callTool("snapshot_voters", { space_id: spaceId }, "snapshot");
  await callTool("governance_health", { space_id: spaceId }, "snapshot");
  await callTool("voting_power", { space_id: spaceId }, "snapshot");
  await callTool("governance_score", { space_id: spaceId }, "snapshot");

  const forumUrl = governance?.forum_url || `https://governance.${protocolName.toLowerCase()}.com`;
  await callTool("forum_posts", { forum_url: forumUrl }, "discourse");
  await callTool("forum_search", { forum_url: forumUrl, query: "proposal" }, "discourse");

  // Step 4: On-Chain & Risk
  console.log("\nStep 4: On-chain & risk");
  await callTool("protocol_news", { protocol_name: protocolName }, "internal");

  // Step 5: Competitive Analysis
  console.log("\nStep 5: Competitive analysis");
  await callTool("compare_protocols", { protocol_ids: [defillamaSlug, "compound-v3", "morpho", "spark"] }, "defillama");
  await callTool("protocol_list", { category: "Lending" }, "defillama");

  // Step 6: Portfolio Fit
  console.log("\nStep 6: Portfolio fit");
  await callTool("get_portfolio", {}, "internal");

  // Log tool calls to DB
  for (const r of results) {
    await db.insert(schema.toolCallLogs).values({
      reviewId: review.id,
      source: r.source,
      toolName: r.name,
      success: r.success,
      latencyMs: r.latencyMs,
      errorMessage: r.success ? null : r.data?.error,
    }).catch(() => {});
  }

  // Save tool call summary to review
  await db
    .update(schema.reviews)
    .set({
      status: "data_gathered",
      toolCalls: results.map(r => ({
        name: r.name,
        args: Object.values(r.args).filter(Boolean).join(", ").slice(0, 60),
        status: r.success ? "complete" : "error",
        latency_ms: r.latencyMs,
      })),
    })
    .where(eq(schema.reviews.id, review.id));

  // Write data package to file for Claude Code to process
  const dataPackage = {
    protocolName,
    notes,
    reviewId: review.id,
    gatheredAt: new Date().toISOString(),
    toolCallCount: results.length,
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length,
    data: Object.fromEntries(results.map(r => [r.name, { success: r.success, data: r.data }])),
  };

  const outPath = `/Users/acct1/committee-orchestrator/apps/api/data/${review.id}.json`;
  await Bun.write(outPath, JSON.stringify(dataPackage, null, 2));

  console.log(`\nData gathering complete.`);
  console.log(`  Total calls: ${results.length}`);
  console.log(`  Successful: ${results.filter(r => r.success).length}`);
  console.log(`  Failed: ${results.filter(r => !r.success).length}`);
  console.log(`  Data saved: ${outPath}`);
  console.log(`\nReview ID: ${review.id}`);
  console.log(`Next: Claude Code processes this data and generates the memo.`);

} catch (error: any) {
  console.error("\nFatal error:", error.message);
  await db
    .update(schema.reviews)
    .set({ status: "failed" })
    .where(eq(schema.reviews.id, review.id));
  process.exit(1);
}

process.exit(0);
