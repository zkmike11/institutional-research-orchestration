const API_BASE = typeof window === "undefined"
  ? (process.env.API_URL || "http://localhost:3001/api")
  : "/api";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export interface Report {
  id: string;
  protocolName: string;
  recommendation: string;
  conviction: string;
  maturationPhase: string | null;
  activismScore: number | null;
  positionSize: string | null;
  content: { raw: string };
  toolCallsCount: number;
  isDemo?: boolean;
  dataCompleteness: any;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  protocolName: string;
  notes: string | null;
  status: string;
  toolCalls: ToolCallEntry[];
  reportId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ToolCallEntry {
  name: string;
  args: string;
  status: string;
  latency_ms?: number;
}

export interface Consensus {
  total: number;
  breakdown: Record<string, number>;
  vetoRate: number;
  avgActivism: number;
}

export interface DataSourceStat {
  source: string;
  tool_name: string;
  success_rate: number;
  avg_latency: number;
  total_calls: number;
  last_failure: string | null;
}

export interface Learning {
  id: string;
  category: string;
  content: string;
  protocol: string | null;
  source: string | null;
  createdAt: string;
}

export interface Signpost {
  id: string;
  description: string;
  status: string;
  convictionImpact: number | null;
  lastChecked: string | null;
  triggeredAt: string | null;
  evidence: string | null;
  createdAt: string;
}

export interface KillCriterion {
  id: string;
  criteria: string;
  status: string;
  monitoringSource: string | null;
  checkFrequency: string | null;
  triggerThreshold: string | null;
  lastChecked: string | null;
  triggeredAt: string | null;
  createdAt: string;
}

export interface ConvictionEntry {
  id: string;
  conviction: string;
  probThesis: number | null;
  reason: string;
  source: string | null;
  createdAt: string;
}

export interface SearchResults {
  reports: Report[];
  learnings: Learning[];
}

export const api = {
  // Reports
  getReports: () => fetchJSON<Report[]>("/reports"),
  getReport: (id: string) => fetchJSON<Report>(`/reports/${id}`),
  deleteReport: (id: string) => fetchJSON(`/reports/${id}`, { method: "DELETE" }),
  getConsensus: () => fetchJSON<Consensus>("/reports/consensus"),

  // Reviews
  startReview: (protocolName: string, notes?: string) =>
    fetchJSON<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify({ protocolName, notes }),
    }),
  getReview: (id: string) => fetchJSON<Review>(`/reviews/${id}`),

  // Learnings
  getLearnings: () => fetchJSON<Learning[]>("/learnings"),
  searchLearnings: (q: string) => fetchJSON<Learning[]>(`/learnings/search?q=${encodeURIComponent(q)}`),
  addLearning: (data: { category: string; content: string; protocol?: string; source?: string }) =>
    fetchJSON<Learning>("/learnings", { method: "POST", body: JSON.stringify(data) }),

  // Data Sources
  getDataSources: (period?: string) =>
    fetchJSON<DataSourceStat[]>(`/data-sources${period ? `?period=${period}` : ""}`),

  // Portfolio
  getPortfolio: () => fetchJSON<any[]>("/portfolio"),

  // Search
  search: (q: string, type?: string) =>
    fetchJSON<SearchResults>(`/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`),

  // Monitoring
  getSignposts: (reportId: string) =>
    fetchJSON<Signpost[]>(`/monitoring/signposts/${reportId}`),
  getKillCriteria: (reportId: string) =>
    fetchJSON<KillCriterion[]>(`/monitoring/kill-criteria/${reportId}`),
  getConvictionTimeline: (reportId: string) =>
    fetchJSON<ConvictionEntry[]>(`/monitoring/conviction/${reportId}`),
};
