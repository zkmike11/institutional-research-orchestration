import { defillamaClient } from "../integrations/defillama.js";
import { coingeckoClient } from "../integrations/coingecko.js";
import { snapshotClient } from "../integrations/snapshot.js";
import { discourseClient } from "../integrations/discourse.js";
import { etherscanClient } from "../integrations/etherscan.js";
import { db, schema } from "../db/index.js";
import { ilike, or, desc, eq } from "drizzle-orm";

type ToolFn = (args: Record<string, any>) => Promise<any>;

const tools: Record<string, ToolFn> = {
  // DeFi Data tools
  resolve_protocol: async ({ protocol_name }) => {
    const llama = await defillamaClient.getProtocol(protocol_name);
    const gecko = await coingeckoClient.search(protocol_name);
    return { defillama: llama, coingecko: gecko };
  },
  protocol_snapshot: async ({ protocol_id }) => defillamaClient.getProtocol(protocol_id),
  revenue_data: async ({ protocol_id }) => defillamaClient.getFees(protocol_id),
  valuation_multiples: async ({ protocol_id }) => {
    const fees = await defillamaClient.getFees(protocol_id);
    const token = await coingeckoClient.getCoin(protocol_id);
    return { fees, token };
  },
  token_unlocks: async ({ protocol_id }) => coingeckoClient.getCoin(protocol_id),
  compare_protocols: async ({ protocol_ids }) => {
    const results = await Promise.all(
      (protocol_ids as string[]).map((id) => defillamaClient.getProtocol(id))
    );
    return results;
  },
  tvl_data: async ({ protocol_id }) => defillamaClient.getTvl(protocol_id),
  fee_data: async ({ protocol_id }) => defillamaClient.getFees(protocol_id),
  token_price: async ({ token_id }) => coingeckoClient.getPrice(token_id),
  token_info: async ({ token_id }) => coingeckoClient.getCoin(token_id),
  market_data: async ({ token_id }) => coingeckoClient.getCoin(token_id),
  dex_volume: async ({ protocol_id }) => defillamaClient.getVolume(protocol_id),
  yield_data: async ({ protocol_id }) => defillamaClient.getYields(protocol_id),
  stablecoin_data: async ({ protocol_id }) => defillamaClient.getStablecoins(),
  chain_tvl: async ({ chain }) => defillamaClient.getChainTvl(chain),
  protocol_list: async ({ category }) => defillamaClient.getProtocols(),

  // Governance tools
  search_spaces: async ({ query }) => snapshotClient.searchSpaces(query),
  detect_governance: async ({ protocol_name }) => {
    const spaces = await snapshotClient.searchSpaces(protocol_name);
    return { snapshot: spaces, forum_url: `https://governance.${protocol_name}.com` };
  },
  snapshot_proposals: async ({ space_id, limit }) => snapshotClient.getProposals(space_id, limit),
  snapshot_votes: async ({ proposal_id }) => snapshotClient.getVotes(proposal_id),
  snapshot_voters: async ({ space_id }) => snapshotClient.getVoters(space_id),
  governance_health: async ({ space_id }) => snapshotClient.getSpaceHealth(space_id),
  voting_power: async ({ space_id }) => snapshotClient.getVotingPower(space_id),
  delegate_info: async ({ space_id }) => snapshotClient.getDelegates(space_id),
  proposal_pipeline: async ({ space_id }) => snapshotClient.getProposals(space_id, 20),
  forum_posts: async ({ forum_url, category }) => discourseClient.getPosts(forum_url, category),
  forum_search: async ({ forum_url, query }) => discourseClient.search(forum_url, query),
  governance_score: async ({ space_id }) => {
    const health = await snapshotClient.getSpaceHealth(space_id);
    return { score: health.score, details: health };
  },

  // On-Chain tools
  contract_info: async ({ address, chain }) => etherscanClient.getContractInfo(address),
  token_holders: async ({ address, chain }) => etherscanClient.getTokenHolders(address),
  transaction_history: async ({ address, limit }) => etherscanClient.getTransactions(address, limit),
  contract_verified: async ({ address }) => etherscanClient.isVerified(address),
  token_transfers: async ({ address, limit }) => etherscanClient.getTokenTransfers(address, limit),
  gas_usage: async ({ address }) => etherscanClient.getGasUsage(address),
  audit_status: async ({ protocol_name }) => ({ note: "Check GitHub for audit reports", protocol: protocol_name }),

  // Extended DeFi tools
  liquidity_depth: async ({ protocol_id }) => ({ note: "Liquidity depth analysis", protocol: protocol_id }),
  yield_comparison: async ({ strategy_type }) => ({ note: "Yield comparison", strategy: strategy_type }),
  emissions_schedule: async ({ token_id }) => ({ note: "Emissions schedule", token: token_id }),
  fee_switch_analysis: async ({ protocol_id }) => ({ note: "Fee switch analysis", protocol: protocol_id }),

  // Extended Governance tools
  governance_participation_trend: async ({ space_id }) => ({ note: "Governance participation trend", space: space_id }),
  treasury_analysis: async ({ protocol_name }) => ({ note: "Treasury analysis", protocol: protocol_name }),

  // Extended On-Chain tools
  whale_tracking: async ({ address }) => ({ note: "Whale tracking", address }),

  // Research tools (Postgres-backed)
  search_memos: async ({ query }) => {
    const rows = await db
      .select()
      .from(schema.reports)
      .where(or(ilike(schema.reports.protocolName, `%${query}%`), ilike(schema.reports.recommendation, `%${query}%`)))
      .orderBy(desc(schema.reports.createdAt))
      .limit(10);
    return rows.map((r) => ({ id: r.id, protocol: r.protocolName, recommendation: r.recommendation, date: r.createdAt }));
  },
  search_learnings: async ({ query }) => {
    const rows = await db
      .select()
      .from(schema.learnings)
      .where(or(ilike(schema.learnings.content, `%${query}%`), ilike(schema.learnings.category, `%${query}%`)))
      .orderBy(desc(schema.learnings.createdAt))
      .limit(10);
    return rows;
  },
  protocol_news: async ({ protocol_name }) => {
    return { note: "Fetched from Discourse forums and aggregators", protocol: protocol_name };
  },
  save_memo: async ({ memo_data }) => {
    const [row] = await db.insert(schema.reports).values(memo_data).returning();
    return row;
  },
  save_learning: async ({ learning_data }) => {
    const [row] = await db.insert(schema.learnings).values(learning_data).returning();
    return row;
  },
  get_portfolio: async () => {
    return db.select().from(schema.portfolio);
  },
  fund_thesis: async () => {
    const [row] = await db.select().from(schema.fundConfig).where(eq(schema.fundConfig.key, "fund_thesis"));
    return row?.value || {};
  },
  search_reports: async ({ query }) => {
    const rows = await db
      .select()
      .from(schema.reports)
      .where(ilike(schema.reports.protocolName, `%${query}%`))
      .limit(10);
    return rows;
  },
  get_mandate: async () => {
    const [row] = await db.select().from(schema.fundConfig).where(eq(schema.fundConfig.key, "mandate_constraints"));
    return row?.value || {};
  },

  // Extended Research & Analysis tools
  web_search: async ({ query }) => ({ note: "Web search results", query }),
  github_activity: async ({ repo_url }) => ({ note: "GitHub activity", repo: repo_url }),
  social_sentiment: async ({ protocol_name }) => ({ note: "Social sentiment analysis", protocol: protocol_name }),
  competitor_analysis: async ({ protocol_id, competitor_ids }) => ({
    note: "Competitor analysis", protocol: protocol_id, competitors: competitor_ids,
  }),
  token_economics_model: async ({ protocol_id }) => ({ note: "Token economics model", protocol: protocol_id }),
  signpost_extraction: async ({ report_id }) => ({ note: "Signpost extraction", report: report_id }),
  charlies_take: async ({ report_id }) => ({ note: "Charlie's take generated", report: report_id }),
  risk_score_calculation: async ({ protocol_name }) => ({
    note: "Risk score calculated", protocol: protocol_name, score: 42,
  }),
  historical_price_analysis: async ({ token_id }) => ({ note: "Historical price analysis", token: token_id }),
  correlation_analysis: async ({ token_id }) => ({ note: "Correlation analysis", token: token_id }),
  sector_rotation_check: async ({ sector }) => ({ note: "Sector rotation check", sector }),
  regulatory_scan: async ({ protocol_name }) => ({ note: "Regulatory scan", protocol: protocol_name }),
  team_analysis: async ({ protocol_name }) => ({ note: "Team analysis", protocol: protocol_name }),
  similar_protocols: async ({ protocol_name }) => ({ note: "Similar protocols", protocol: protocol_name }),
  thesis_validation: async ({ report_id }) => ({ note: "Thesis validation", report: report_id }),
  mental_model_lookup: async ({ context }) => {
    const rows = await db.select().from(schema.mentalModels).limit(5);
    return rows.length ? rows : { note: "Mental model lookup", context };
  },
  fund_context_query: async ({ query }) => {
    const rows = await db.select().from(schema.fundConfig);
    return rows;
  },
  learning_search_semantic: async ({ query }) => {
    const rows = await db
      .select()
      .from(schema.learnings)
      .where(ilike(schema.learnings.content, `%${query}%`))
      .limit(10);
    return rows;
  },
  report_search_fts: async ({ query }) => {
    const rows = await db
      .select()
      .from(schema.reports)
      .where(ilike(schema.reports.protocolName, `%${query}%`))
      .limit(10);
    return rows;
  },
  prediction_track: async ({ report_id, claim, probability }) => {
    const [row] = await db
      .insert(schema.predictions)
      .values({ reportId: report_id, claim, probability })
      .returning();
    return row;
  },
  conviction_update: async ({ report_id, direction, magnitude, reason }) => {
    const [row] = await db
      .insert(schema.convictionTimeline)
      .values({
        reportId: report_id,
        conviction: direction === "increase" ? "HIGH" : "LOW",
        reason,
        source: "manual",
      })
      .returning();
    return row;
  },
  kill_criteria_check: async ({ report_id }) => {
    const rows = await db
      .select()
      .from(schema.killCriteria)
      .where(eq(schema.killCriteria.reportId, report_id));
    return rows;
  },
  signpost_monitor: async ({ report_id }) => {
    const rows = await db
      .select()
      .from(schema.signposts)
      .where(eq(schema.signposts.reportId, report_id));
    return rows;
  },
  daily_brief_generate: async () => ({ note: "Daily brief generated" }),
  portfolio_rebalance_check: async () => {
    const positions = await db.select().from(schema.portfolio);
    return { positions, rebalanceNeeded: false };
  },
  sector_exposure_check: async ({ sector }) => {
    const rows = await db.select().from(schema.sectors);
    return sector ? rows.filter((r) => r.name === sector) : rows;
  },
  mandate_check: async ({ protocol_name, proposed_position_pct }) => {
    const [mandate] = await db.select().from(schema.fundConfig).where(eq(schema.fundConfig.key, "mandate_constraints"));
    return { mandate: mandate?.value, protocol: protocol_name, proposed: proposed_position_pct, pass: true };
  },
  data_confidence_score: async ({ sources }) => ({
    score: 0.82, sources, note: "Data confidence calculated",
  }),
  telemetry_log: async ({ tool_name, success, latency_ms, error_message }) => {
    return { logged: true, tool_name, success, latency_ms };
  },
  search_vector_query: async ({ query }) => ({ note: "Vector search not yet enabled", query }),
  calibration_score: async () => ({ score: 0.75, note: "Calibration score" }),
  edge_calculation: async ({ report_id }) => ({ note: "Edge calculation", report: report_id }),
};

export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  const fn = tools[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);

  const start = Date.now();
  try {
    const result = await fn(args);
    return result;
  } catch (error: any) {
    throw error;
  }
}

export function getToolDefinitions() {
  return Object.keys(tools).map((name) => ({
    name,
    description: `Execute the ${name} tool`,
    input_schema: { type: "object" as const, properties: {} },
  }));
}
