const BASE = "https://api.coingecko.com/api/v3";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${url}`);
  return res.json();
}

export const coingeckoClient = {
  async search(query: string) {
    const data = await fetchJson(`${BASE}/search?query=${encodeURIComponent(query)}`);
    return data.coins?.slice(0, 5) || [];
  },

  async getCoin(id: string) {
    return fetchJson(
      `${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
  },

  async getPrice(id: string) {
    return fetchJson(`${BASE}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
  },

  async getMarketChart(id: string, days = 30) {
    return fetchJson(`${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
  },
};
