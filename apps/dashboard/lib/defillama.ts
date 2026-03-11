const BASE = "https://api.llama.fi";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DefiLlama ${res.status}: ${url}`);
  return res.json();
}

export async function getChains(): Promise<
  { name: string; tvl: number; tokenSymbol?: string }[]
> {
  return fetchJson(`${BASE}/v2/chains`);
}

export async function getProtocols(): Promise<any[]> {
  return fetchJson(`${BASE}/protocols`);
}

export async function getProtocol(slug: string) {
  return fetchJson(`${BASE}/protocol/${slug}`);
}

export async function getOverviewFees(): Promise<any> {
  return fetchJson(`${BASE}/overview/fees`);
}

export async function getFees(slug: string) {
  const [summary, revenue] = await Promise.all([
    fetchJson(`${BASE}/summary/fees/${slug}`).catch(() => null),
    fetchJson(`${BASE}/summary/revenue/${slug}`).catch(() => null),
  ]);
  return { fees: summary, revenue };
}

export async function getYields(project?: string): Promise<any[]> {
  const data = await fetchJson("https://yields.llama.fi/pools");
  const pools = data.data || [];
  if (project) {
    return pools
      .filter((p: any) => p.project?.toLowerCase() === project.toLowerCase())
      .slice(0, 30);
  }
  return pools.slice(0, 100);
}

export async function getStablecoins() {
  return fetchJson("https://stablecoins.llama.fi/stablecoins?includePrices=true");
}
