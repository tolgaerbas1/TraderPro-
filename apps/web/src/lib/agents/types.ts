import type { AgentDirection, AgentInsight, ConsensusAction, StockQuote } from "@/types";

export type AgentId = AgentInsight["agent"];

export interface AgentWeights {
  fundamental: number;
  technical: number;
  regime: number;
  risk: number;
}

export interface AgentContext {
  quote: StockQuote;
  marketRegime: "risk_on" | "risk_off" | "neutral";
  spyChangePercent: number;
  qqqChangePercent: number;
  diaChangePercent: number;
  marketMomentum: number;
}

export interface AgentBreakdown {
  subScores: Record<string, number>;
  bullCase: string[];
  bearCase: string[];
  risks: string[];
}

export interface ExtendedAgentInsight extends AgentInsight {
  signals: string[];
  score: number;
  veto?: boolean;
  breakdown: AgentBreakdown;
  recommendedPositionPct?: number;
}

export interface CoordinatorResult {
  consensus: ConsensusAction;
  confidence: number;
  summaryEn: string;
  summaryTr: string;
  score: number;
  approved: boolean;
  vetoReason?: string;
  suggestedPositionPct: number;
  conflicts: string[];
  bullCase: string[];
  bearCase: string[];
  keyRisks: string[];
  regimeContext: string;
}

export interface FullStockAnalysis {
  symbol: string;
  name: string;
  consensus: ConsensusAction;
  consensusConfidence: number;
  summaryEn: string;
  summaryTr: string;
  agents: ExtendedAgentInsight[];
  coordinator: CoordinatorResult;
  analyzedAt: string;
}

export interface AgentAccuracyStat {
  agent: AgentId;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

export interface DailyBriefing {
  generatedAt: string;
  marketSummaryEn: string;
  marketSummaryTr: string;
  topBuys: { symbol: string; confidence: number }[];
  topSells: { symbol: string; confidence: number }[];
  holds: string[];
  highlightsEn: string[];
  highlightsTr: string[];
}

export const DEFAULT_WEIGHTS: AgentWeights = {
  fundamental: 0.3,
  technical: 0.35,
  regime: 0.2,
  risk: 0.15,
};

export function directionScore(d: AgentDirection): number {
  if (d === "long") return 1;
  if (d === "short") return -1;
  return 0;
}
