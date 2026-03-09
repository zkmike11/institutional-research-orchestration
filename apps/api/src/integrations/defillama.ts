const BASE = "https://api.llama.fi";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DefiLlama ${res.status}: ${url}`);
  return res.json();
}

export const defillamaClient = {
  async getProtocols() {
    return fetchJson(`${BASE}/protocols`);
  },

  async getProtocol(slug: string) {
    return fetchJson(`${BASE}/protocol/${slug}`);
  },

  async getTvl(slug: string) {
    return fetchJson(`${BASE}/tvl/${slug}`);
  },

  async getFees(slug: string) {
    const [summary, daily] = await Promise.all([
      fetchJson(`${BASE}/summary/fees/${slug}`).catch(() => null),
      fetchJson(`${BASE}/summary/revenue/${slug}`).catch(() => null),
    ]);
    return { fees: summary, revenue: daily };
  },

  async getVolume(slug: string) {
    return fetchJson(`https://api.llama.fi/summary/dexs/${slug}`).catch(() => null);
  },

  async getYields(slug?: string) {
    const data = await fetchJson(`https://yields.llama.fi/pools`);
    if (slug) {
      return data.data?.filter((p: any) => p.project?.toLowerCase() === slug.toLowerCase()).slice(0, 20);
    }
    return data.data?.slice(0, 50);
  },

  async getStablecoins() {
    return fetchJson(`https://stablecoins.llama.fi/stablecoins`);
  },

  async getChainTvl(chain: string) {
    return fetchJson(`${BASE}/v2/historicalChainTvl/${chain}`);
  },
};
