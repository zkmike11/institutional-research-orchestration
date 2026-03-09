import type { YieldCurveSnapshot, SpreadData } from "@/lib/types/yield-curve";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const SERIES_IDS: Record<string, string> = {
  "3M": "DTB3",
  "2Y": "DGS2",
  "5Y": "DGS5",
  "10Y": "DGS10",
  "30Y": "DGS30",
};

const SNAPSHOT_OFFSETS: { label: string; daysBack: number; color: string; dashed: boolean }[] = [
  { label: "Current", daysBack: 0, color: "#3b82f6", dashed: false },
  { label: "1W ago", daysBack: 7, color: "#ef4444", dashed: true },
  { label: "1M ago", daysBack: 30, color: "#f59e0b", dashed: true },
  { label: "3M ago", daysBack: 90, color: "#6b7280", dashed: true },
  { label: "1Y ago", daysBack: 365, color: "#4b5563", dashed: true },
];

const SPREAD_PAIR_SERIES: Record<string, [string, string]> = {
  "3M/10Y": ["DTB3", "DGS10"],
  "2Y/5Y": ["DGS2", "DGS5"],
  "5Y/30Y": ["DGS5", "DGS30"],
  "10Y/30Y": ["DGS10", "DGS30"],
};

function dateOffset(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0];
}

async function fetchLatestObservation(
  seriesId: string,
  apiKey: string,
  asOfDate?: string
): Promise<number> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: "desc",
    limit: "1",
  });
  if (asOfDate) {
    params.set("observation_end", asOfDate);
  }
  const res = await fetch(`${FRED_BASE}?${params}`);
  const data = await res.json();
  const obs = data.observations?.[0];
  return obs?.value !== "." ? parseFloat(obs?.value ?? "0") : 0;
}

export async function getYieldCurve(date?: string) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return getMockYieldCurve();
  }

  const observations = await Promise.all(
    Object.entries(SERIES_IDS).map(async ([maturity, seriesId]) => {
      const value = await fetchLatestObservation(seriesId, apiKey, date);
      return { maturity, yield: value };
    })
  );

  return observations;
}

export async function getMultiDateYieldCurve(): Promise<YieldCurveSnapshot[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return getMockMultiDateYieldCurve();
  }

  const snapshots = await Promise.all(
    SNAPSHOT_OFFSETS.map(async ({ label, daysBack, color, dashed }) => {
      const asOfDate = daysBack === 0 ? undefined : dateOffset(daysBack);
      const points = await Promise.all(
        Object.entries(SERIES_IDS).map(async ([maturity, seriesId]) => {
          const value = await fetchLatestObservation(seriesId, apiKey, asOfDate);
          return { maturity, yield: value };
        })
      );
      return { label, color, dashed, points };
    })
  );

  return snapshots;
}

export async function getSpreadHistory(
  pair: string,
  daysBack: number
): Promise<SpreadData[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return getMockSpreadHistory(daysBack);
  }

  const seriesIds = SPREAD_PAIR_SERIES[pair];
  if (!seriesIds) return [];

  const startDate = dateOffset(daysBack);
  const [shortId, longId] = seriesIds;

  const [shortData, longData] = await Promise.all(
    [shortId, longId].map(async (seriesId) => {
      const params = new URLSearchParams({
        series_id: seriesId,
        api_key: apiKey,
        file_type: "json",
        observation_start: startDate,
      });
      const res = await fetch(`${FRED_BASE}?${params}`);
      const data = await res.json();
      const map = new Map<string, number>();
      for (const o of data.observations ?? []) {
        if (o.value !== ".") {
          map.set(o.date, parseFloat(o.value));
        }
      }
      return map;
    })
  );

  // Compute spread for dates that have both values
  const result: SpreadData[] = [];
  for (const [date, longVal] of longData) {
    const shortVal = shortData.get(date);
    if (shortVal !== undefined) {
      result.push({ date, spread: Math.round((longVal - shortVal) * 100) });
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getYieldCurveHistory(
  seriesId: string,
  daysBack: number = 90
) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return [];

  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    observation_start: start.toISOString().split("T")[0],
  });

  const res = await fetch(`${FRED_BASE}?${params}`);
  const data = await res.json();

  return (data.observations ?? [])
    .filter((o: { value: string }) => o.value !== ".")
    .map((o: { date: string; value: string }) => ({
      date: o.date,
      value: parseFloat(o.value),
    }));
}

function getMockYieldCurve() {
  return [
    { maturity: "3M", yield: 3.6 },
    { maturity: "2Y", yield: 3.41 },
    { maturity: "5Y", yield: 3.67 },
    { maturity: "10Y", yield: 4.08 },
    { maturity: "30Y", yield: 4.72 },
  ];
}

function getMockMultiDateYieldCurve(): YieldCurveSnapshot[] {
  return [
    {
      label: "Current",
      color: "#3b82f6",
      dashed: false,
      points: [
        { maturity: "3M", yield: 3.6 },
        { maturity: "2Y", yield: 3.41 },
        { maturity: "5Y", yield: 3.67 },
        { maturity: "10Y", yield: 4.08 },
        { maturity: "30Y", yield: 4.72 },
      ],
    },
    {
      label: "1W ago",
      color: "#ef4444",
      dashed: true,
      points: [
        { maturity: "3M", yield: 3.58 },
        { maturity: "2Y", yield: 3.45 },
        { maturity: "5Y", yield: 3.72 },
        { maturity: "10Y", yield: 4.12 },
        { maturity: "30Y", yield: 4.78 },
      ],
    },
    {
      label: "1M ago",
      color: "#f59e0b",
      dashed: true,
      points: [
        { maturity: "3M", yield: 3.55 },
        { maturity: "2Y", yield: 3.50 },
        { maturity: "5Y", yield: 3.80 },
        { maturity: "10Y", yield: 4.20 },
        { maturity: "30Y", yield: 4.85 },
      ],
    },
    {
      label: "3M ago",
      color: "#6b7280",
      dashed: true,
      points: [
        { maturity: "3M", yield: 3.70 },
        { maturity: "2Y", yield: 3.60 },
        { maturity: "5Y", yield: 3.90 },
        { maturity: "10Y", yield: 4.30 },
        { maturity: "30Y", yield: 4.90 },
      ],
    },
    {
      label: "1Y ago",
      color: "#4b5563",
      dashed: true,
      points: [
        { maturity: "3M", yield: 4.20 },
        { maturity: "2Y", yield: 4.00 },
        { maturity: "5Y", yield: 3.95 },
        { maturity: "10Y", yield: 4.15 },
        { maturity: "30Y", yield: 4.50 },
      ],
    },
  ];
}

function getMockSpreadHistory(daysBack: number): SpreadData[] {
  const data: SpreadData[] = [];
  const now = new Date();
  for (let i = daysBack; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const base = 48 + Math.sin(i / 15) * 12 + (Math.random() - 0.5) * 6;
    data.push({
      date: d.toISOString().split("T")[0],
      spread: Math.round(base),
    });
  }
  return data;
}
