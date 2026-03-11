#!/usr/bin/env bun
/**
 * Summarize raw data package into a condensed format for Claude Code.
 *
 * Usage: bun run src/cli/summarize-data.ts <review_id>
 *
 * Reads: data/{reviewId}.json (84MB+ raw API responses)
 * Writes: data/{reviewId}-summary.json (~15KB condensed metrics)
 */

const reviewId = process.argv[2];

if (!reviewId) {
  console.error("Usage: bun run src/cli/summarize-data.ts <review_id>");
  process.exit(1);
}

const dataPath = `${import.meta.dir}/../../data/${reviewId}.json`;
const file = Bun.file(dataPath);

if (!(await file.exists())) {
  console.error(`Data file not found: ${dataPath}`);
  process.exit(1);
}

console.log(`Reading raw data for review ${reviewId}...`);
const raw = JSON.parse(await file.text());

function get(toolName: string): any {
  const entry = raw.data?.[toolName];
  if (!entry?.success) return null;
  return entry.data;
}

function latestTvl(tvlArray: any[]): number | null {
  if (!Array.isArray(tvlArray) || tvlArray.length === 0) return null;
  return tvlArray[tvlArray.length - 1]?.totalLiquidityUSD ?? null;
}

function tvlTrend(tvlArray: any[]): { current: number; oneMonthAgo: number; threeMonthsAgo: number; oneYearAgo: number } | null {
  if (!Array.isArray(tvlArray) || tvlArray.length === 0) return null;
  const current = tvlArray[tvlArray.length - 1]?.totalLiquidityUSD;
  const oneMonth = tvlArray[Math.max(0, tvlArray.length - 30)]?.totalLiquidityUSD;
  const threeMonths = tvlArray[Math.max(0, tvlArray.length - 90)]?.totalLiquidityUSD;
  const oneYear = tvlArray[Math.max(0, tvlArray.length - 365)]?.totalLiquidityUSD;
  return { current, oneMonthAgo: oneMonth, threeMonthsAgo: threeMonths, oneYearAgo: oneYear };
}

// === Extract each data source ===

// Resolution
const resolved = get("resolve_protocol");
const defillamaData = resolved?.defillama;
const coingeckoResults = resolved?.coingecko;

// Token info (CoinGecko /coins/:id — most complete data source)
const tokenInfo = get("token_info") || get("market_data");
const marketData = tokenInfo?.market_data;

// Protocol snapshot (DefiLlama)
const snapshot = get("protocol_snapshot");

// Fee data
const feeData = get("fee_data");
const fees = feeData?.fees;
const revenue = feeData?.revenue;

// Revenue data (alternate source)
const revenueData = get("revenue_data");

// TVL — tvl_data may be a number (current TVL) or array; protocol_snapshot.tvl is the historical array
const tvlRaw = get("tvl_data");
const snapshotTvlArray = snapshot?.tvl;
const tvlHistorical = Array.isArray(snapshotTvlArray) ? tvlTrend(snapshotTvlArray) : null;
const tvlCurrent = typeof tvlRaw === "number" ? tvlRaw : tvlHistorical?.current ?? null;

// Valuation multiples
const valuation = get("valuation_multiples");

// Token unlocks
const unlocks = get("token_unlocks");

// Governance
const proposals = get("snapshot_proposals");
const voters = get("snapshot_voters");
const votingPower = get("voting_power");
const govScore = get("governance_score");
const govHealth = get("governance_health");

// Forum
const forumPosts = get("forum_posts");
const forumSearch = get("forum_search");

// Competitive
const compareData = get("compare_protocols");
const protocolList = get("protocol_list");

// Internal
const fundThesis = get("fund_thesis");
const mandate = get("get_mandate");
const portfolio = get("get_portfolio");
const priorMemos = get("search_memos");
const learnings = get("search_learnings");
const news = get("protocol_news");

// === Build summary ===

const summary: Record<string, any> = {
  protocolName: raw.protocolName,
  reviewId: raw.reviewId,
  gatheredAt: raw.gatheredAt,

  identity: {
    name: defillamaData?.name || snapshot?.name || raw.protocolName,
    category: defillamaData?.category || snapshot?.category || null,
    chains: (defillamaData?.chains || snapshot?.chains || []).slice(0, 10),
    description: tokenInfo?.description?.en?.slice(0, 500) || snapshot?.description?.slice(0, 500) || null,
    coingeckoId: coingeckoResults?.[0]?.id || null,
    symbol: tokenInfo?.symbol?.toUpperCase() || null,
    marketCapRank: tokenInfo?.market_cap_rank || null,
    links: {
      website: tokenInfo?.links?.homepage?.[0] || null,
      twitter: tokenInfo?.links?.twitter_screen_name || null,
      github: tokenInfo?.links?.repos_url?.github?.[0] || null,
    },
  },

  financials: {
    price: marketData?.current_price?.usd ?? null,
    priceChange24h: marketData?.price_change_percentage_24h ?? null,
    priceChange30d: marketData?.price_change_percentage_30d ?? null,
    ath: marketData?.ath?.usd ?? null,
    athDate: marketData?.ath_date?.usd ?? null,
    marketCap: marketData?.market_cap?.usd ?? null,
    fdv: marketData?.fully_diluted_valuation?.usd ?? null,
    volume24h: marketData?.total_volume?.usd ?? null,
    circulatingSupply: marketData?.circulating_supply ?? null,
    maxSupply: marketData?.max_supply ?? null,
    totalSupply: marketData?.total_supply ?? null,
  },

  tvl: {
    current: tvlCurrent,
    oneMonthAgo: tvlHistorical?.oneMonthAgo ?? null,
    threeMonthsAgo: tvlHistorical?.threeMonthsAgo ?? null,
    oneYearAgo: tvlHistorical?.oneYearAgo ?? null,
    change30d: tvlCurrent && tvlHistorical?.oneMonthAgo ? ((tvlCurrent - tvlHistorical.oneMonthAgo) / tvlHistorical.oneMonthAgo * 100).toFixed(1) + "%" : null,
    change1y: tvlCurrent && tvlHistorical?.oneYearAgo ? ((tvlCurrent - tvlHistorical.oneYearAgo) / tvlHistorical.oneYearAgo * 100).toFixed(1) + "%" : null,
  },

  fees: {
    fees24h: fees?.total24h ?? null,
    fees7d: fees?.total7d ?? null,
    fees30d: fees?.total30d ?? null,
    revenue24h: revenue?.total24h ?? null,
    revenue30d: revenue?.total30d ?? null,
    revenueAnnualized: revenue?.total30d ? (revenue.total30d * 12) : null,
  },

  valuation: valuation ? {
    feesData: valuation.fees ? {
      fees24h: valuation.fees.fees?.total24h ?? null,
      fees7d: valuation.fees.fees?.total7d ?? null,
      revenue24h: valuation.fees.revenue?.total24h ?? null,
    } : null,
  } : null,

  tokenomics: {
    circulatingSupply: marketData?.circulating_supply ?? null,
    maxSupply: marketData?.max_supply ?? null,
    circulatingPct: marketData?.circulating_supply && marketData?.max_supply
      ? ((marketData.circulating_supply / marketData.max_supply) * 100).toFixed(1) + "%"
      : null,
    unlockData: unlocks || null,
  },

  governance: {
    proposals: proposals?.proposals?.slice(0, 8).map((p: any) => ({
      title: p.title,
      state: p.state,
      votes: p.votes,
      scoresTotal: p.scores_total,
      created: p.created ? new Date(p.created * 1000).toISOString().slice(0, 10) : null,
      end: p.end ? new Date(p.end * 1000).toISOString().slice(0, 10) : null,
    })) ?? null,
    topVoters: voters?.voters?.slice(0, 10).map((v: any) => ({
      address: v.voter?.slice(0, 10) + "...",
      vp: v.vp,
      pct: voters.total_vp ? ((v.vp / voters.total_vp) * 100).toFixed(1) + "%" : null,
    })) ?? null,
    totalVP: voters?.total_vp ?? votingPower?.total_vp ?? null,
    topVoterPct: votingPower?.top_voter_pct ?? null,
    top5Pct: votingPower?.top_5_pct ?? null,
    score: govScore ?? null,
    health: govHealth ?? null,
  },

  community: {
    forumTopics: Array.isArray(forumPosts)
      ? forumPosts.slice(0, 5).map((p: any) => p.title || p.fancy_title || p.slug).filter(Boolean)
      : null,
    forumSearchResults: Array.isArray(forumSearch)
      ? forumSearch.slice(0, 5).map((r: any) => r.title || r.blurb?.slice(0, 80)).filter(Boolean)
      : null,
    news: news?.note || null,
  },

  competitive: {
    peers: compareData ? Object.values(compareData).map((p: any) => ({
      name: p?.name || "Unknown",
      tvl: latestTvl(p?.tvl),
      mcap: p?.mcap ?? null,
    })) : null,
    sectorProtocols: Array.isArray(protocolList)
      ? protocolList.slice(0, 10).map((p: any) => ({
          name: p?.name,
          tvl: latestTvl(p?.tvl) || p?.tvl,
        }))
      : null,
  },

  portfolio: {
    fundThesis: fundThesis ?? null,
    mandate: mandate ?? null,
    currentPositions: portfolio ?? null,
    priorMemos: priorMemos ?? null,
    learnings: learnings ?? null,
  },

  dataCompleteness: {
    total: raw.toolCallCount,
    succeeded: raw.successCount,
    failed: raw.failCount,
    tools: Object.entries(raw.data || {}).map(([name, val]: [string, any]) => ({
      name,
      success: val?.success ?? false,
    })),
  },
};

const outPath = `${import.meta.dir}/../../data/${reviewId}-summary.json`;
await Bun.write(outPath, JSON.stringify(summary, null, 2));

const size = (await Bun.file(outPath).size);
console.log(`Summary saved: ${outPath}`);
console.log(`Size: ${(size / 1024).toFixed(1)}KB (from ${(await file.size / 1024 / 1024).toFixed(1)}MB raw)`);
console.log(`\nNext: Claude Code reads this summary and generates the 18-section memo.`);

process.exit(0);
