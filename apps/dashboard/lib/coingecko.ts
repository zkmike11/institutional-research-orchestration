const BASE = "https://api.coingecko.com/api/v3";

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${url}`);
  return res.json();
}

/** Batch fetch market data for multiple coins */
export async function getMarkets(ids: string[]) {
  const idsParam = ids.join(",");
  return fetchJson(
    `${BASE}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
  );
}

/** Single coin details (includes FDV, ATH, description, links) */
export async function getCoin(id: string) {
  return fetchJson(
    `${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
}

/** Global crypto market stats (total mcap, btc dominance, etc.) */
export async function getGlobal() {
  return fetchJson(`${BASE}/global`);
}

/** Search for coins by query */
export async function search(query: string) {
  const data = await fetchJson(`${BASE}/search?query=${encodeURIComponent(query)}`);
  return data.coins?.slice(0, 10) || [];
}

/** Top coins by market cap (for treemap) */
export async function getTopCoins(limit = 30) {
  return fetchJson(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&sparkline=false&price_change_percentage=24h`
  );
}
