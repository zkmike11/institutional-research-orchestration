const BASE = "https://api.etherscan.io/api";
const API_KEY = process.env.ETHERSCAN_API_KEY || "";

async function fetchEtherscan(params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
  const res = await fetch(`${BASE}?${qs}`);
  if (!res.ok) throw new Error(`Etherscan ${res.status}`);
  const data = await res.json();
  if (data.status === "0" && data.message !== "No transactions found") {
    throw new Error(`Etherscan: ${data.result || data.message}`);
  }
  return data.result;
}

export const etherscanClient = {
  async getContractInfo(address: string) {
    const source = await fetchEtherscan({
      module: "contract",
      action: "getsourcecode",
      address,
    });
    return Array.isArray(source) ? source[0] : source;
  },

  async getTokenHolders(address: string) {
    return { note: "Token holder data requires Etherscan Pro", address };
  },

  async getTransactions(address: string, limit = 10) {
    return fetchEtherscan({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: String(limit),
      sort: "desc",
    });
  },

  async isVerified(address: string) {
    const info = await etherscanClient.getContractInfo(address);
    return { verified: !!info?.SourceCode, compiler: info?.CompilerVersion };
  },

  async getTokenTransfers(address: string, limit = 10) {
    return fetchEtherscan({
      module: "account",
      action: "tokentx",
      address,
      page: "1",
      offset: String(limit),
      sort: "desc",
    });
  },

  async getGasUsage(address: string) {
    const txs = await etherscanClient.getTransactions(address, 50);
    if (!Array.isArray(txs)) return { avg_gas: 0 };
    const avgGas = txs.reduce((s: number, t: any) => s + parseInt(t.gasUsed || "0"), 0) / Math.max(txs.length, 1);
    return { avg_gas: Math.round(avgGas), recent_tx_count: txs.length };
  },
};
