#!/usr/bin/env bun
/**
 * Generate a Deep Research prompt for a protocol review.
 *
 * Usage: bun run src/cli/deep-research.ts <review_id>
 *
 * Reads: data/{reviewId}-summary.json
 * Outputs: Structured research prompt to stdout (copy to claude.ai Deep Research)
 * Save output to: data/{reviewId}-research.md
 *
 * Pipeline: gather-data → summarize-data → deep-research → Claude Code memo → save-memo
 */

const reviewId = process.argv[2];

if (!reviewId) {
  console.error("Usage: bun run src/cli/deep-research.ts <review_id>");
  console.error("\nReads the summary JSON and generates a Deep Research prompt.");
  console.error("Copy the prompt to claude.ai Deep Research, then save output to:");
  console.error("  data/{reviewId}-research.md");
  process.exit(1);
}

const summaryPath = `/Users/acct1/committee-orchestrator/apps/api/data/${reviewId}-summary.json`;
const file = Bun.file(summaryPath);

if (!(await file.exists())) {
  console.error(`Summary not found: ${summaryPath}`);
  console.error("Run summarize-data first: bun run review:summarize " + reviewId);
  process.exit(1);
}

const summary = JSON.parse(await file.text());
const name = summary.protocolName;
const category = summary.identity?.category || "DeFi protocol";
const chains = summary.identity?.chains?.join(", ") || "unknown chain(s)";
const tvl = summary.tvl?.current ? `$${(summary.tvl.current / 1e9).toFixed(1)}B` : "unknown";
const mcap = summary.financials?.marketCap ? `$${(summary.financials.marketCap / 1e9).toFixed(1)}B` : "unknown";
const description = summary.identity?.description?.slice(0, 200) || "";

const prompt = `
Research ${name} for an institutional DeFi investment memo. ${name} is a ${category} with ${tvl} TVL and ${mcap} market cap. ${description}

I need deep research on the following areas. For each, provide specific data points, dates, and sources.

## 1. Recent developments (last 6 months)
- Major protocol upgrades, launches, or migrations
- Partnership announcements and integrations
- Security incidents, exploits, or near-misses
- Team changes (hires, departures, restructuring)
- Regulatory actions or compliance developments

## 2. Competitive landscape
- How does ${name} compare to its top 3-5 competitors on fees, TVL, volume, and user growth?
- What is ${name}'s market share trend in its sector?
- Are there emerging competitors or forks that threaten its position?
- What differentiated features does ${name} have vs competitors?

## 3. Revenue and fee analysis
- What are ${name}'s fee structures (trading fees, protocol fees, liquidation fees)?
- How has revenue trended over the last 12 months?
- What percentage of fees go to the protocol vs LPs/stakers/validators?
- Are there fee switch proposals or revenue distribution changes under discussion?

## 4. Token economics and distribution
- Detailed vesting schedule with dates and cohort breakdowns
- Current unlock status and upcoming cliff events
- Token utility (governance, staking, fee sharing, gas)
- Any buyback, burn, or revenue-sharing mechanisms?

## 5. Governance and community
- Governance structure (onchain voting, multisig, DAO, foundation)
- Recent controversial or significant governance proposals
- Power concentration among top voters/delegates
- Community sentiment on governance direction

## 6. Risk factors
- Known smart contract vulnerabilities or audit findings
- Regulatory risks specific to ${name}'s jurisdiction and product type
- Centralization risks (admin keys, upgrade authority, oracle dependencies)
- Historical incidents and how they were handled

## 7. On-chain activity
- Active user trends (DAU, WAU, MAU)
- Transaction volume trends
- Whale activity and large holder movements
- Protocol usage metrics specific to ${name}'s product

Format your response with clear section headers, specific numbers with dates, and source citations where possible.
`.trim();

console.log("=".repeat(80));
console.log("DEEP RESEARCH PROMPT FOR:", name);
console.log("=".repeat(80));
console.log();
console.log(prompt);
console.log();
console.log("=".repeat(80));
console.log("\nInstructions:");
console.log("1. Copy the prompt above to claude.ai Deep Research");
console.log("2. Save the output to:");
console.log(`   data/${reviewId}-research.md`);
console.log("3. When writing the memo, Claude Code will read both the summary and research files.");
console.log("=".repeat(80));

process.exit(0);
