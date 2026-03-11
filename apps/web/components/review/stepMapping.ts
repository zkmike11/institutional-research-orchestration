export interface PipelineStep {
  label: string;
  color: string; // CSS color for the step header
}

const STEP_MAP: Record<string, PipelineStep> = {
  // Step 0: Protocol Resolution
  resolve_protocol: { label: "STEP 0: PROTOCOL RESOLUTION", color: "var(--fg-secondary)" },
  search_memos: { label: "STEP 0: PROTOCOL RESOLUTION", color: "var(--fg-secondary)" },
  search_learnings: { label: "STEP 0: PROTOCOL RESOLUTION", color: "var(--fg-secondary)" },
  mental_model_lookup: { label: "STEP 0: PROTOCOL RESOLUTION", color: "var(--fg-secondary)" },

  // Step 1: Intelligence Gathering
  protocol_snapshot: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  revenue_data: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  fee_data: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  tvl_data: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  token_price: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  token_info: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  market_data: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  token_unlocks: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  emissions_schedule: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  detect_governance: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  search_spaces: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  governance_participation_trend: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  protocol_news: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  web_search: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  social_sentiment: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },
  forum_search: { label: "STEP 1: INTELLIGENCE GATHERING", color: "var(--accent-purple)" },

  // GATE: Mandate Check
  fund_thesis: { label: "GATE: MANDATE CHECK", color: "#eab308" },
  get_mandate: { label: "GATE: MANDATE CHECK", color: "#eab308" },
  mandate_check: { label: "GATE: MANDATE CHECK", color: "#eab308" },

  // Step 2: Deep Dive
  stablecoin_data: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  yield_data: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  yield_comparison: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  compare_protocols: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  liquidity_depth: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  fee_switch_analysis: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  snapshot_proposals: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  snapshot_voters: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  governance_health: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  voting_power: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  forum_posts: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  governance_score: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  treasury_analysis: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  contract_info: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  contract_verified: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  token_holders: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  transaction_history: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  token_transfers: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  gas_usage: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  whale_tracking: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  github_activity: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  audit_status: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  search_reports: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  protocol_list: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  team_analysis: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  regulatory_scan: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },
  similar_protocols: { label: "STEP 2: DEEP DIVE", color: "var(--accent-purple)" },

  // Step 3: Competitive Intelligence
  competitor_analysis: { label: "STEP 3: COMPETITIVE INTELLIGENCE", color: "var(--accent-purple)" },
  valuation_multiples: { label: "STEP 3: COMPETITIVE INTELLIGENCE", color: "var(--accent-purple)" },
  sector_rotation_check: { label: "STEP 3: COMPETITIVE INTELLIGENCE", color: "var(--accent-purple)" },

  // Step 4: Maturation Scoring
  historical_price_analysis: { label: "STEP 4: MATURATION SCORING", color: "var(--accent-purple)" },
  token_economics_model: { label: "STEP 4: MATURATION SCORING", color: "var(--accent-purple)" },

  // Step 5: Risk + Sizing (VETO POWER)
  risk_score_calculation: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },
  correlation_analysis: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },
  data_confidence_score: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },
  get_portfolio: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },
  sector_exposure_check: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },
  portfolio_rebalance_check: { label: "STEP 5: RISK + SIZING", color: "var(--accent-red)" },

  // Step 7: Report Assembly
  thesis_validation: { label: "STEP 7: REPORT ASSEMBLY", color: "var(--accent-purple)" },
  prediction_track: { label: "STEP 7: REPORT ASSEMBLY", color: "var(--accent-purple)" },
  save_memo: { label: "STEP 7: REPORT ASSEMBLY", color: "var(--accent-purple)" },

  // Step 8: Committee Decision + Post-Processing
  charlies_take: { label: "STEP 8: COMMITTEE DECISION", color: "var(--accent-green)" },
  signpost_extraction: { label: "STEP 8: COMMITTEE DECISION", color: "var(--accent-green)" },
  telemetry_log: { label: "STEP 8: COMMITTEE DECISION", color: "var(--accent-green)" },
};

const DEFAULT_STEP: PipelineStep = { label: "PROCESSING", color: "var(--fg-secondary)" };

export function getStepForTool(toolName: string): PipelineStep {
  return STEP_MAP[toolName] || DEFAULT_STEP;
}
