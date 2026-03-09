# Committee Orchestrator

AI-powered investment committee system that produces institutional-quality DeFi protocol research memos. Inspired by [Markets, Inc.](https://x.com/deaneigenmann) by Dean Eigenmann.

A single AI orchestrator embodies 14 specialist roles (Tokenomics Analyst, Governance Analyst, Risk Officer, Devil's Advocate, etc.) and produces structured 18-section investment memos with inline data citations from live market data.

## Architecture

```
committee-orchestrator/
├── apps/
│   ├── api/          # Hono backend (port 3001) — orchestration, data integrations, CLI pipeline
│   ├── web/          # Next.js 15 frontend (port 3000) — memo viewer, review tracker
│   └── dashboard/    # Next.js 15 market dashboard (port 3002) — 13 views, real-time data
└── packages/
    └── shared/       # Shared TypeScript types and constants
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| API | Hono |
| Frontend | Next.js 15, React 19 |
| Database | PostgreSQL, Drizzle ORM |
| AI | Anthropic Claude (Opus) |
| Data Sources | DefiLlama, CoinGecko, Snapshot, Etherscan, Discourse |
| Charts | Lightweight Charts, D3 |
| Build | Turborepo |

## Features

### Investment Committee
- 14 specialist AI roles analyzing each protocol
- 18-section structured memo format with Mental Models (Intrinsic Value, Network Economies, Expected Value, Myerson Value, Value at Risk)
- Editorial quality enforcement (anti-AI-slop rules)
- Risk Officer with veto power
- Inline data citations from live APIs

### CLI Pipeline
```bash
# 1. Gather data from 5 free APIs (DefiLlama, CoinGecko, Snapshot, Etherscan, Discourse)
bun run review:gather "Hyperliquid"

# 2. Summarize raw data (84MB → 9KB condensed metrics)
bun run review:summarize <review_id>

# 3. Generate Deep Research prompt (optional — copy to claude.ai)
bun run review:research <review_id>

# 4. Write memo with Claude Code (reads summary + research)
# 5. Save completed memo to database
bun run review:save <review_id> data/<review_id>-memo.md
```

### Web Interface (port 3000)
- Report library with recommendation badges (BUY/WATCH/HOLD/REDUCE/EXIT)
- Decision consensus visualization
- Full memo rendering with sticky table of contents and scroll-spy
- Real-time review progress via SSE (tool call tracking)
- Data source reliability monitoring
- Demo mode with pre-loaded Morpho analysis

### Market Dashboard (port 3002)
- 13 views: Performance, Scanner, Sectors, Deep Dive, Volatility, Top Movers, Heatmap, Risk/Reward, Fundamentals, News, Events, Filings, Notes
- Real-time market data via Yahoo Finance
- Yield curve visualization
- Sector breakdown and heatmap
- Watchlist management

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.3+
- PostgreSQL 14+
- Node.js 20+ (for Next.js)

### Setup

```bash
# Install dependencies
bun install

# Create database
createdb committee_orchestrator

# Run migrations
bun run db:migrate

# Seed demo data (Aave + Morpho sample memos)
bun run db:seed

# Copy environment template
cp apps/api/.env.example apps/api/.env
# Edit .env with your DATABASE_URL if not using defaults
```

### Development

```bash
# Start all apps (API on 3001, Web on 3000, Dashboard on 3002)
bun run dev

# Or start individually:
cd apps/api && bun run dev       # API server
cd apps/web && bun run dev       # Web frontend
cd apps/dashboard && bun run dev # Market dashboard
```

### Build

```bash
bun run build  # Builds all packages via Turborepo
```

## Data Sources

All financial data is sourced from free, public APIs:

| Source | Data | Endpoints |
|--------|------|-----------|
| DefiLlama | TVL, fees, revenue, volume, protocol snapshots | `api.llama.fi` |
| CoinGecko | Token prices, market cap, supply, market data | `api.coingecko.com` |
| Snapshot | Governance proposals, voting power, delegates | `hub.snapshot.org` |
| Etherscan | Contract verification, transactions, gas usage | `api.etherscan.io` |
| Discourse | Forum posts, community sentiment | Per-protocol forums |

## Sample Output

The system produces institutional-quality memos. Example for Hyperliquid:

- **Recommendation**: BUY (HIGH conviction)
- **Position Size**: 5% NAV
- **Key Insight**: $762M annualized fees at 9.6x MCap/Fees, below comparable infrastructure multiples
- **Primary Risk**: 76.2% token supply not yet circulating (dilution overhang)

## Project Structure

```
apps/api/src/
├── cli/              # CLI pipeline scripts
│   ├── gather-data.ts    # Data collection from 5 APIs
│   ├── summarize-data.ts # Raw data → condensed summary
│   ├── deep-research.ts  # Deep Research prompt generator
│   └── save-memo.ts      # Persist memo to database
├── db/               # Database (Drizzle ORM)
│   ├── schema.ts         # Tables: reports, reviews, learnings, portfolio, fund_config
│   ├── seed.ts           # Demo data seeder
│   └── migrate.ts        # Migration runner
├── integrations/     # External API clients
│   ├── defillama.ts      # Protocol TVL, fees, revenue
│   ├── coingecko.ts      # Token prices, market data
│   ├── snapshot.ts       # Governance voting (GraphQL)
│   ├── etherscan.ts      # On-chain data
│   └── discourse.ts      # Forum sentiment
├── routes/           # Hono API routes
│   ├── reports.ts        # CRUD + consensus stats
│   ├── reviews.ts        # Review lifecycle + SSE stream
│   ├── learnings.ts      # Institutional memory
│   ├── portfolio.ts      # Position tracking
│   ├── data-sources.ts   # Tool call reliability
│   └── tools.ts          # Direct tool execution
└── services/         # Core logic
    ├── system-prompt.ts   # 14-agent committee prompt
    ├── orchestrator.ts    # Review orchestration loop
    ├── tool-executor.ts   # Tool dispatch (46+ tools)
    ├── tool-schemas.ts    # Tool definitions
    └── demo-review.ts     # Simulated review mode
```

## License

MIT
