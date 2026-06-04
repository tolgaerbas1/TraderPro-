export type Language = "tr" | "en";

export type AgentDirection = "long" | "short" | "neutral";
export type ConsensusAction = "buy" | "sell" | "hold";

export interface StockMeta {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
  sector: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  changeWeek: number;
  changeMonth: number;
  volume: number;
  marketCap: number;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  dividendYield: number | null;
  high52w: number;
  low52w: number;
  updatedAt: string;
  dataSource?: "live" | "cached" | "mock";
}

export interface AgentInsight {
  agent: "fundamental" | "technical" | "regime" | "risk";
  direction: AgentDirection;
  confidence: number;
  summaryEn: string;
  summaryTr: string;
  signals?: string[];
  veto?: boolean;
}

export interface StockAnalysis {
  symbol: string;
  name?: string;
  consensus: ConsensusAction;
  consensusConfidence: number;
  summaryEn: string;
  summaryTr: string;
  agents: AgentInsight[];
  coordinator?: {
    approved: boolean;
    suggestedPositionPct: number;
    conflicts: string[];
    vetoReason?: string;
  };
  analyzedAt?: string;
}

export interface RadarFilter {
  peMax?: number;
  peMin?: number;
  roeMin?: number;
  changeDayMin?: number;
  changeWeekMin?: number;
  sector?: string;
  consensus?: ConsensusAction;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  sector?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  totalPnL: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  weekChangePercent: number;
  positions: PortfolioPosition[];
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  sellPrice: number;
  realizedPnL: number;
  closedAt: string;
}

export interface PnLHistoryPoint {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  portfolioReturn: number;
  benchmarkReturn: number;
}

export interface AllocationSlice {
  symbol: string;
  value: number;
  weight: number;
}

export interface PositionPerformance {
  symbol: string;
  quantity: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChangePercent: number;
  weight: number;
}

export interface PerformanceReport {
  portfolio: PortfolioSummary;
  history: PnLHistoryPoint[];
  allocation: AllocationSlice[];
  positionPerformance: PositionPerformance[];
  closedTrades: ClosedTrade[];
  winRate: number;
  bestPerformer: PositionPerformance | null;
  worstPerformer: PositionPerformance | null;
  benchmarkSymbol: string;
  benchmarkOutperformance: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface WidgetLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  type: "market" | "limit";
  limitPrice?: number;
  fillPrice?: number;
  status: "pending" | "filled" | "cancelled";
  createdAt: string;
  note?: string;
}
