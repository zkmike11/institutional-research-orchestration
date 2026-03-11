import { NextRequest, NextResponse } from "next/server";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { GovernanceSummary } from "@/lib/types/crypto";

const SNAPSHOT_GQL = "https://hub.snapshot.org/graphql";

async function gql(query: string, variables: Record<string, any> = {}) {
  const res = await fetch(SNAPSHOT_GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Snapshot ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function GET(request: NextRequest) {
  try {
    const space = request.nextUrl.searchParams.get("space");
    if (!space) {
      return NextResponse.json({ error: "space parameter required" }, { status: 400 });
    }

    const cacheKey = `crypto-governance:${space}`;
    const cached = cache.get<GovernanceSummary>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const proposalsData = await gql(
      `query ($space: String!) {
        proposals(
          where: { space: $space }
          orderBy: "created"
          orderDirection: desc
          first: 10
        ) {
          id
          title
          state
          votes
          scores_total
          start
          end
        }
      }`,
      { space }
    );

    const proposals = (proposalsData?.proposals ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      state: p.state,
      votes: p.votes,
      scoresTotal: p.scores_total,
      start: p.start,
      end: p.end,
    }));

    // Get top voters from most recent closed proposal for concentration
    let voterConcentration = null;
    const closedProposal = proposals.find((p: any) => p.state === "closed");
    if (closedProposal) {
      const votesData = await gql(
        `query ($proposalId: String!) {
          votes(
            where: { proposal: $proposalId }
            orderBy: "vp"
            orderDirection: desc
            first: 100
          ) {
            vp
          }
        }`,
        { proposalId: closedProposal.id }
      );

      const votes = votesData?.votes ?? [];
      if (votes.length > 0) {
        const totalVp = votes.reduce((sum: number, v: any) => sum + (v.vp ?? 0), 0);
        const topVoterVp = votes[0]?.vp ?? 0;
        const top5Vp = votes.slice(0, 5).reduce((sum: number, v: any) => sum + (v.vp ?? 0), 0);

        voterConcentration = {
          topVoterPct: totalVp > 0 ? (topVoterVp / totalVp) * 100 : 0,
          top5Pct: totalVp > 0 ? (top5Vp / totalVp) * 100 : 0,
          totalVp,
        };
      }
    }

    const result: GovernanceSummary = { proposals, voterConcentration };
    cache.set(cacheKey, result, CACHE_TTL.GOVERNANCE);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/governance error:", error);
    return NextResponse.json({ proposals: [], voterConcentration: null }, { status: 500 });
  }
}
