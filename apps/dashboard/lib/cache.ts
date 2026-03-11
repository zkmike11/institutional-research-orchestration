interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiry: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new TTLCache();

export const CACHE_TTL = {
  QUOTES: 120_000,
  HISTORICAL: 3_600_000,
  COMPANY_INFO: 86_400_000,
  YIELD_CURVE: 21_600_000,
  VOLATILITY: 120_000,
  DEFI_OVERVIEW: 300_000,
  PROTOCOL: 600_000,
  YIELDS: 600_000,
  GOVERNANCE: 1_800_000,
  CRYPTO_MARKET: 300_000,
} as const;
