export const MEMO_SECTIONS = [
  { number: 1, title: "Executive Summary", key: "executive_summary" },
  { number: 2, title: "Maturation Cycle Assessment", key: "maturation_cycle" },
  { number: 3, title: "Precedent Analysis", key: "precedent_analysis" },
  { number: 4, title: "Mental Models Applied", key: "mental_models" },
  { number: 5, title: "Fundamental Analysis", key: "fundamental_analysis" },
  { number: 6, title: "Governance Analysis", key: "governance_analysis" },
  { number: 7, title: "Valuation", key: "valuation" },
  { number: 10, title: "Risk Assessment", key: "risk_assessment" },
  { number: 11, title: "Portfolio Assessment", key: "portfolio_assessment" },
  { number: 12, title: "Recommendation", key: "recommendation" },
  { number: 13, title: "Thesis Kill Criteria", key: "thesis_kill_criteria" },
  { number: 15, title: "Position Lifecycle", key: "position_lifecycle" },
  { number: 16, title: "Data Completeness Matrix", key: "data_completeness" },
  { number: 17, title: "Scenario Matrix", key: "scenario_matrix" },
  { number: 18, title: "What We Don't Know", key: "what_we_dont_know" },
] as const;

export const MENTAL_MODELS = [
  { model: "Intrinsic Value", discipline: "Investing" },
  { model: "Network Economies", discipline: "Investing" },
  { model: "Expected Value", discipline: "Investing" },
  { model: "Myerson Value", discipline: "Game Theory" },
  { model: "Value at Risk", discipline: "Investing" },
] as const;
