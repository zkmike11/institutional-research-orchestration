import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_SCHEMAS: Anthropic.Tool[] = [
  // ═══════════════════════════════════════
  // DeFi Data Tools (20)
  // ═══════════════════════════════════════
  {
    name: "resolve_protocol",
    description: "Resolve a protocol name to canonical DefiLlama and CoinGecko IDs. Always call this first to handle naming differences across data sources.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name to resolve (e.g. 'Aave', 'Uniswap', 'Lido')" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "protocol_snapshot",
    description: "Get a comprehensive overview of a protocol: TVL, revenue, fees, token price, market cap. Combines DefiLlama and CoinGecko data.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
        coingecko_id: { type: "string", description: "CoinGecko coin ID (optional)" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "revenue_data",
    description: "Get protocol revenue and fee data: annualized fees, annualized revenue, 30-day fees, 24-hour fees, revenue breakdown.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "tvl_data",
    description: "Get TVL history and breakdown by chain for a protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
        timeframe: { type: "string", description: "Timeframe: '7d', '30d', '90d', '1y', 'all'", default: "90d" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "fee_data",
    description: "Get fee data and trends for a protocol (daily, weekly, monthly breakdown).",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
        timeframe: { type: "string", description: "Timeframe: '7d', '30d', '90d'", default: "30d" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "token_price",
    description: "Get current token price, ATH, 30-day change, and trading volume from CoinGecko.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "token_info",
    description: "Get full token details: description, links, categories, platforms, market data from CoinGecko.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "market_data",
    description: "Get market data: market cap, FDV, 24h volume, exchange listings from CoinGecko.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "valuation_multiples",
    description: "Calculate valuation multiples: MCap/Revenue, FDV/Revenue, MCap/Fees, FDV/TVL. Combines DefiLlama and CoinGecko data.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
        coingecko_id: { type: "string", description: "CoinGecko coin ID" },
      },
      required: ["protocol_id", "coingecko_id"],
    },
  },
  {
    name: "token_unlocks",
    description: "Get token supply data: circulating supply, max supply, emission schedule from CoinGecko.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "compare_protocols",
    description: "Compare multiple protocols side-by-side on TVL, fees, revenue, and key metrics.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of DefiLlama protocol slugs to compare",
        },
      },
      required: ["protocol_ids"],
    },
  },
  {
    name: "dex_volume",
    description: "Get DEX trading volume data for a protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "yield_data",
    description: "Get yield/APY data across pools for a protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "DefiLlama protocol slug or project name" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "stablecoin_data",
    description: "Get stablecoin metrics and data if applicable to the protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "Protocol name or stablecoin identifier" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "chain_tvl",
    description: "Get chain-level TVL data and history.",
    input_schema: {
      type: "object" as const,
      properties: {
        chain: { type: "string", description: "Chain name (e.g. 'Ethereum', 'Arbitrum', 'Base')" },
      },
      required: ["chain"],
    },
  },
  {
    name: "protocol_list",
    description: "List protocols in a category or sector for competitive analysis.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: { type: "string", description: "Category to filter by (e.g. 'Lending', 'DEX', 'Liquid Staking')" },
      },
      required: ["category"],
    },
  },
  {
    name: "liquidity_depth",
    description: "Analyze order book depth, bid/ask spread, and liquidity concentration across exchanges and DEX pools.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "Protocol identifier" },
      },
      required: ["protocol_id"],
    },
  },
  {
    name: "yield_comparison",
    description: "Compare yield rates across protocols for similar strategies (lending, LP, staking).",
    input_schema: {
      type: "object" as const,
      properties: {
        strategy_type: { type: "string", description: "Strategy type (e.g. 'lending', 'staking', 'lp')" },
        min_tvl: { type: "number", description: "Minimum TVL filter (optional)" },
      },
      required: ["strategy_type"],
    },
  },
  {
    name: "emissions_schedule",
    description: "Get detailed token emissions timeline: monthly emission rates, cliff dates, and vesting curves.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "Token identifier" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "fee_switch_analysis",
    description: "Analyze protocol fee switch status: is fee switch on, proposed fee changes, revenue distribution to token holders.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "Protocol identifier" },
      },
      required: ["protocol_id"],
    },
  },

  // ═══════════════════════════════════════
  // Governance Tools (14)
  // ═══════════════════════════════════════
  {
    name: "search_spaces",
    description: "Search for Snapshot governance spaces for a protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Protocol name to search for in Snapshot" },
      },
      required: ["query"],
    },
  },
  {
    name: "detect_governance",
    description: "Auto-detect governance endpoints for a protocol (Snapshot space, forum URL, on-chain governance).",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "snapshot_proposals",
    description: "Get recent Snapshot governance proposals with vote counts, status, and outcomes.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID (e.g. 'aave.eth')" },
        limit: { type: "number", description: "Number of proposals to fetch (default 10)" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "snapshot_votes",
    description: "Get individual votes on a specific Snapshot proposal, ordered by voting power.",
    input_schema: {
      type: "object" as const,
      properties: {
        proposal_id: { type: "string", description: "Snapshot proposal ID" },
      },
      required: ["proposal_id"],
    },
  },
  {
    name: "snapshot_voters",
    description: "Get top voters and voting power distribution for a Snapshot space.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "governance_health",
    description: "Get governance health metrics: quorum rates, proposal cadence, participation trends.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "voting_power",
    description: "Analyze voting power concentration: top voter %, top 5 %, Gini coefficient.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "delegate_info",
    description: "Get delegate program details for a governance space.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "proposal_pipeline",
    description: "Get categorized view of active, pending, and recent proposals.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "forum_posts",
    description: "Get recent forum posts/topics from a Discourse forum.",
    input_schema: {
      type: "object" as const,
      properties: {
        forum_url: { type: "string", description: "Discourse forum base URL (e.g. 'https://governance.aave.com')" },
        category: { type: "string", description: "Optional category slug to filter" },
      },
      required: ["forum_url"],
    },
  },
  {
    name: "forum_search",
    description: "Search a Discourse forum for specific topics or discussions.",
    input_schema: {
      type: "object" as const,
      properties: {
        forum_url: { type: "string", description: "Discourse forum base URL" },
        query: { type: "string", description: "Search query" },
      },
      required: ["forum_url", "query"],
    },
  },
  {
    name: "governance_score",
    description: "Calculate a composite governance health score (0-100) based on participation, quorum rates, proposal quality, and power distribution.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
      },
      required: ["space_id"],
    },
  },
  {
    name: "treasury_analysis",
    description: "Analyze protocol treasury: composition, runway, diversification, spending rate, and stablecoin reserves.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "governance_participation_trend",
    description: "Get historical governance participation metrics: voter turnout trends, proposal frequency, delegate growth over time.",
    input_schema: {
      type: "object" as const,
      properties: {
        space_id: { type: "string", description: "Snapshot space ID" },
        timeframe: { type: "string", description: "Timeframe for trend data (default '90d')", default: "90d" },
      },
      required: ["space_id"],
    },
  },

  // ═══════════════════════════════════════
  // On-Chain Tools (8)
  // ═══════════════════════════════════════
  {
    name: "contract_info",
    description: "Get smart contract details: source code, compiler version, verification status from Etherscan.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Contract address (0x...)" },
        chain: { type: "string", description: "Chain name (default: Ethereum)", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "token_holders",
    description: "Get top token holders and holder count for an ERC-20 token.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Token contract address" },
        chain: { type: "string", description: "Chain name", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "transaction_history",
    description: "Get recent transactions for a contract or address.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Contract or wallet address" },
        limit: { type: "number", description: "Number of transactions (default 10)" },
        chain: { type: "string", description: "Chain name", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "contract_verified",
    description: "Check if a smart contract is verified on Etherscan and get compiler info.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Contract address" },
        chain: { type: "string", description: "Chain name", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "token_transfers",
    description: "Get recent token transfer events for an address.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Address to check transfers for" },
        limit: { type: "number", description: "Number of transfers (default 10)" },
        chain: { type: "string", description: "Chain name", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "gas_usage",
    description: "Analyze gas usage patterns for a contract address.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Contract address" },
        chain: { type: "string", description: "Chain name", default: "ethereum" },
      },
      required: ["address"],
    },
  },
  {
    name: "audit_status",
    description: "Check for known security audits of a protocol. Searches for audit reports.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name to check audits for" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "whale_tracking",
    description: "Track large holder activity: accumulation/distribution patterns, wallet age, and concentration changes over time.",
    input_schema: {
      type: "object" as const,
      properties: {
        address: { type: "string", description: "Token contract address or wallet address" },
        chain: { type: "string", description: "Chain name (default: ethereum)", default: "ethereum" },
        timeframe: { type: "string", description: "Timeframe for tracking (default '30d')", default: "30d" },
      },
      required: ["address"],
    },
  },

  // ═══════════════════════════════════════
  // Research & Internal Tools (41)
  // ═══════════════════════════════════════
  {
    name: "search_memos",
    description: "Search previous investment memos in the database. Use to check if we've reviewed this protocol before.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (protocol name or topic)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_learnings",
    description: "Search institutional learnings and knowledge base. Contains insights from past reviews and IC discussions.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "protocol_news",
    description: "Get recent news and developments for a protocol from forums and web sources.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "save_memo",
    description: "Save a completed investment memo to the database.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
        recommendation: { type: "string", description: "BUY | WATCH | HOLD | REDUCE | EXIT" },
        conviction: { type: "string", description: "LOW | MEDIUM | HIGH" },
        content: { type: "string", description: "Full memo content in markdown" },
      },
      required: ["protocol_name", "recommendation", "conviction", "content"],
    },
  },
  {
    name: "save_learning",
    description: "Save a new institutional learning or insight for future reference.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: { type: "string", description: "Category: sector | protocol | data_quality | methodology" },
        content: { type: "string", description: "The learning or insight" },
        protocol: { type: "string", description: "Related protocol (optional)" },
        source: { type: "string", description: "Source of the learning" },
      },
      required: ["category", "content"],
    },
  },
  {
    name: "get_portfolio",
    description: "Get current portfolio snapshot: positions, sector allocations, total exposure.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "fund_thesis",
    description: "Get the fund's current investment thesis, strategy, and focus areas.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "search_reports",
    description: "Search across all past reports and analysis.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_mandate",
    description: "Get fund mandate constraints: max position size, sector limits, liquidity requirements.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },

  // ─── Extended Research & Internal Tools ───
  {
    name: "web_search",
    description: "Search the web for protocol information, news, and analysis.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        num_results: { type: "number", description: "Number of results to return (default 10)", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "github_activity",
    description: "Get GitHub repository activity: commit frequency, contributors, open issues, recent PRs.",
    input_schema: {
      type: "object" as const,
      properties: {
        repo_url: { type: "string", description: "GitHub repository URL" },
      },
      required: ["repo_url"],
    },
  },
  {
    name: "social_sentiment",
    description: "Analyze social media sentiment for a protocol across Twitter/X and crypto forums.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
        timeframe: { type: "string", description: "Timeframe for sentiment analysis (default '7d')", default: "7d" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "competitor_analysis",
    description: "Detailed competitive analysis: market share, growth rates, feature comparison, and moat assessment.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "Primary protocol identifier" },
        competitor_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of competitor protocol identifiers",
        },
      },
      required: ["protocol_id", "competitor_ids"],
    },
  },
  {
    name: "token_economics_model",
    description: "Model token value accrual: fee capture, burn mechanics, staking yield, and projected token value.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_id: { type: "string", description: "Protocol identifier" },
        coingecko_id: { type: "string", description: "CoinGecko coin ID" },
      },
      required: ["protocol_id", "coingecko_id"],
    },
  },
  {
    name: "signpost_extraction",
    description: "Extract key monitoring signposts from a completed investment memo for ongoing tracking.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to extract signposts from" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "charlies_take",
    description: "Generate an independent counter-opinion on the investment thesis (Charlie Munger-style inversion).",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to generate counter-opinion for" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "risk_score_calculation",
    description: "Calculate quantitative risk score (0-100) across all risk categories with weighted components.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "historical_price_analysis",
    description: "Analyze historical price patterns: drawdowns, recovery times, volatility regimes, and correlation with BTC/ETH.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
        timeframe: { type: "string", description: "Timeframe for analysis (default '1y')", default: "1y" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "correlation_analysis",
    description: "Calculate correlation matrix between a protocol and existing portfolio positions.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_id: { type: "string", description: "CoinGecko token ID" },
      },
      required: ["token_id"],
    },
  },
  {
    name: "sector_rotation_check",
    description: "Check sector momentum and rotation signals: capital flows between DeFi sectors.",
    input_schema: {
      type: "object" as const,
      properties: {
        sector: { type: "string", description: "DeFi sector (e.g. 'Lending', 'DEX', 'Liquid Staking')" },
      },
      required: ["sector"],
    },
  },
  {
    name: "regulatory_scan",
    description: "Scan regulatory environment: recent enforcement actions, legislation, and classification risks for the protocol's sector.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
        jurisdiction: { type: "string", description: "Jurisdiction to scan (default 'US')", default: "US" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "team_analysis",
    description: "Analyze team background, track record, funding history, and key person risk.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "similar_protocols",
    description: "Find protocols with similar architecture, token model, or market positioning using pattern matching.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
      },
      required: ["protocol_name"],
    },
  },
  {
    name: "thesis_validation",
    description: "Validate investment thesis against available data: check if key assumptions hold.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to validate thesis for" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "mental_model_lookup",
    description: "Look up relevant mental models from the institutional knowledge base for a given analysis context.",
    input_schema: {
      type: "object" as const,
      properties: {
        context: { type: "string", description: "Analysis context to find relevant mental models for" },
        limit: { type: "number", description: "Maximum number of models to return (default 5)", default: 5 },
      },
      required: ["context"],
    },
  },
  {
    name: "fund_context_query",
    description: "Query the fund's context documents: mandate, risk policy, thesis, and strategic insights.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Query string" },
      },
      required: ["query"],
    },
  },
  {
    name: "learning_search_semantic",
    description: "Semantic search over institutional learnings using vector similarity.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Maximum number of results (default 10)", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "report_search_fts",
    description: "Full-text search across all past reports with relevance scoring.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Maximum number of results (default 10)", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "prediction_track",
    description: "Track and update a prediction: log the claim, probability, and resolution status.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID the prediction relates to" },
        claim: { type: "string", description: "The prediction claim" },
        probability: { type: "number", description: "Probability estimate (0-1)" },
      },
      required: ["report_id", "claim", "probability"],
    },
  },
  {
    name: "conviction_update",
    description: "Update conviction level for a protocol based on new evidence (Bayesian update).",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to update conviction for" },
        direction: { type: "string", description: "Direction of update: 'increase' or 'decrease'" },
        magnitude: { type: "number", description: "Magnitude of the update" },
        reason: { type: "string", description: "Reason for the conviction change" },
      },
      required: ["report_id", "direction", "magnitude", "reason"],
    },
  },
  {
    name: "kill_criteria_check",
    description: "Check if any kill criteria have been triggered for a protocol's active position.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to check kill criteria for" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "signpost_monitor",
    description: "Check current status of monitoring signposts for a protocol.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to monitor signposts for" },
      },
      required: ["report_id"],
    },
  },
  {
    name: "daily_brief_generate",
    description: "Generate a daily brief: portfolio updates, signpost fires, new protocol discoveries.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "portfolio_rebalance_check",
    description: "Check if portfolio needs rebalancing based on current positions, sector limits, and conviction changes.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "sector_exposure_check",
    description: "Check current sector exposure against mandate limits.",
    input_schema: {
      type: "object" as const,
      properties: {
        sector: { type: "string", description: "Specific sector to check (optional, checks all if omitted)" },
      },
      required: [],
    },
  },
  {
    name: "mandate_check",
    description: "Run full mandate compliance check: position limits, sector concentration, liquidity requirements.",
    input_schema: {
      type: "object" as const,
      properties: {
        protocol_name: { type: "string", description: "Protocol name" },
        proposed_position_pct: { type: "number", description: "Proposed position size as percentage of portfolio" },
      },
      required: ["protocol_name", "proposed_position_pct"],
    },
  },
  {
    name: "data_confidence_score",
    description: "Calculate data confidence score based on source reliability, recency, and cross-validation.",
    input_schema: {
      type: "object" as const,
      properties: {
        sources: {
          type: "array",
          items: { type: "string" },
          description: "Array of data source identifiers used",
        },
      },
      required: ["sources"],
    },
  },
  {
    name: "telemetry_log",
    description: "Log telemetry data for tool execution: latency, success rate, error details.",
    input_schema: {
      type: "object" as const,
      properties: {
        tool_name: { type: "string", description: "Name of the tool that was executed" },
        success: { type: "boolean", description: "Whether the tool execution succeeded" },
        latency_ms: { type: "number", description: "Execution latency in milliseconds" },
        error_message: { type: "string", description: "Error message if execution failed (optional)" },
      },
      required: ["tool_name", "success", "latency_ms"],
    },
  },
  {
    name: "search_vector_query",
    description: "Perform semantic vector search across all indexed content (reports, learnings, fund context).",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        content_type: { type: "string", description: "Content type filter (optional, e.g. 'report', 'learning', 'context')" },
        limit: { type: "number", description: "Maximum number of results (default 10)", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "calibration_score",
    description: "Calculate prediction calibration score: how well past probability estimates matched actual outcomes.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "edge_calculation",
    description: "Calculate KL-divergence edge: how much our probability estimates differ from market-implied probabilities.",
    input_schema: {
      type: "object" as const,
      properties: {
        report_id: { type: "string", description: "Report ID to calculate edge for" },
      },
      required: ["report_id"],
    },
  },
];
