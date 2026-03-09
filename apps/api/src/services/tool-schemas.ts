import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_SCHEMAS: Anthropic.Tool[] = [
  // ═══════════════════════════════════════
  // DeFi Data Tools (16)
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

  // ═══════════════════════════════════════
  // Governance Tools (12)
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

  // ═══════════════════════════════════════
  // On-Chain Tools (7)
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

  // ═══════════════════════════════════════
  // Research Tools (9)
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
];
