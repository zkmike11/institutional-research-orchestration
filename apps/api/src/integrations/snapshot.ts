const ENDPOINT = "https://hub.snapshot.org/graphql";

async function gql(query: string, variables: Record<string, any> = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Snapshot ${res.status}`);
  const data = await res.json();
  return data.data;
}

export const snapshotClient = {
  async searchSpaces(query: string) {
    return gql(
      `query { spaces(first: 5, where: { id_contains: "${query.toLowerCase()}" }) { id name members followers proposalsCount } }`
    );
  },

  async getProposals(spaceId: string, limit = 10) {
    return gql(
      `query { proposals(first: ${limit}, where: { space: "${spaceId}" }, orderBy: "created", orderDirection: desc) {
        id title state scores_total votes start end choices scores author
      }}`
    );
  },

  async getVotes(proposalId: string) {
    return gql(
      `query { votes(first: 100, where: { proposal: "${proposalId}" }, orderBy: "vp", orderDirection: desc) {
        voter vp choice created
      }}`
    );
  },

  async getVoters(spaceId: string) {
    const proposals = await snapshotClient.getProposals(spaceId, 5);
    if (!proposals?.proposals?.length) return { voters: [], concentration: null };
    const recentProposalId = proposals.proposals[0].id;
    const votes = await snapshotClient.getVotes(recentProposalId);
    return {
      voters: votes?.votes?.slice(0, 20) || [],
      total_vp: votes?.votes?.reduce((s: number, v: any) => s + (v.vp || 0), 0) || 0,
    };
  },

  async getVotingPower(spaceId: string) {
    const { voters, total_vp } = await snapshotClient.getVoters(spaceId);
    if (!voters.length) return { concentration: "unknown" };
    const topVoterPct = total_vp > 0 ? ((voters[0]?.vp || 0) / total_vp) * 100 : 0;
    const top5Pct = total_vp > 0
      ? (voters.slice(0, 5).reduce((s: number, v: any) => s + (v.vp || 0), 0) / total_vp) * 100
      : 0;
    return { top_voter_pct: topVoterPct, top_5_pct: top5Pct, total_vp, voters: voters.slice(0, 10) };
  },

  async getSpaceHealth(spaceId: string) {
    const data = await gql(
      `query { space(id: "${spaceId}") { id name proposalsCount members followers voting { quorum } } }`
    );
    const proposals = await snapshotClient.getProposals(spaceId, 20);
    const total = proposals?.proposals?.length || 0;
    const passedCount = proposals?.proposals?.filter((p: any) => p.state === "closed").length || 0;

    return {
      space: data?.space,
      proposal_count_90d: total,
      quorum_rate: total > 0 ? Math.round((passedCount / total) * 100) : 0,
      score: Math.min(100, total * 5 + (passedCount / Math.max(total, 1)) * 50),
    };
  },

  async getDelegates(spaceId: string) {
    return { note: "Delegate data via Snapshot API", space: spaceId };
  },
};
