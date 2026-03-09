export type Recommendation = "BUY" | "WATCH" | "HOLD" | "REDUCE" | "EXIT";
export type Conviction = "LOW" | "MEDIUM" | "HIGH";
export type MaturationPhase = "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4";
export type ReviewStatus = "pending" | "running" | "complete" | "failed";
export type DataStatus = "Success" | "Partial" | "Failed";

export interface ToolCallEvent {
  name: string;
  args: string;
  status: "pending" | "running" | "complete" | "error";
  result_summary?: string;
  source?: string;
  latency_ms?: number;
}

export interface MemoMetadata {
  protocol_name: string;
  recommendation: Recommendation;
  conviction: Conviction;
  maturation_phase: MaturationPhase;
  activism_score: number;
  position_size: string;
  date: string;
}

export interface MemoSection {
  number: number;
  title: string;
  content: string;
}

export interface DataCompletenessEntry {
  category: string;
  sources_used: string;
  status: DataStatus;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export interface DataSourceReliability {
  source: string;
  tool: string;
  success_rate: number;
  avg_latency_ms: number;
  calls: number;
  last_failure: string | null;
}

export interface DecisionConsensus {
  total_reviews: number;
  veto_rate: number;
  avg_activism: number;
  buy_count: number;
  watch_count: number;
  hold_count: number;
}

export interface ProtocolReport {
  id: string;
  protocol_name: string;
  recommendation: Recommendation;
  conviction: Conviction;
  maturation_phase: MaturationPhase;
  activism_score: number;
  position_size: string;
  versions: number;
  latest: string;
  content: Record<string, MemoSection>;
  tool_calls_count: number;
  data_completeness: DataCompletenessEntry[];
}
