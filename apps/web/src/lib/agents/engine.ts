import { getAgentWeights } from "./config";
import { runFundamentalAgent } from "./fundamental-agent";
import { runTechnicalAgent } from "./technical-agent";
import { runRegimeAgent } from "./regime-agent";
import { runRiskAgent } from "./risk-agent";
import { runCoordinator } from "./coordinator";
import { recordPrediction, getAccuracyStats } from "./accuracy";
import type { FullStockAnalysis, AgentContext, DailyBriefing } from "./types";
import type { MarketIndex, StockQuote } from "@/types";
import { getStockQuote, getWatchlistQuotes, getMarketIndices } from "@/lib/market-data";
import { DEFAULT_WATCHLIST } from "@/lib/stocks";

const MARKET_SNAPSHOT_TTL = 30_000;
let marketSnapshotCache: { ts: number; value: MarketSnapshot } | null = null;

interface MarketSnapshot {
  spyChangePercent: number;
  qqqChangePercent: number;
  diaChangePercent: number;
  marketMomentum: number;
}

function detectRegime(spyChange: number): AgentContext["marketRegime"] {
  if (spyChange > 0.3) return "risk_on";
  if (spyChange < -0.3) return "risk_off";
  return "neutral";
}

async function buildContext(quote: StockQuote): Promise<AgentContext> {
  const snapshot = await getMarketSnapshot();
  return {
    quote,
    marketRegime: detectRegime(snapshot.spyChangePercent),
    spyChangePercent: snapshot.spyChangePercent,
    qqqChangePercent: snapshot.qqqChangePercent,
    diaChangePercent: snapshot.diaChangePercent,
    marketMomentum: snapshot.marketMomentum,
  };
}

function summarizeMarketMomentum(indices: MarketIndex[]): MarketSnapshot {
  const spy = indices.find((i) => i.symbol === "SPY");
  const qqq = indices.find((i) => i.symbol === "QQQ");
  const dia = indices.find((i) => i.symbol === "DIA");
  const spyChangePercent = spy?.changePercent ?? 0;
  const qqqChangePercent = qqq?.changePercent ?? 0;
  const diaChangePercent = dia?.changePercent ?? 0;
  const marketMomentum = (spyChangePercent * 0.45) + (qqqChangePercent * 0.35) + (diaChangePercent * 0.2);
  return { spyChangePercent, qqqChangePercent, diaChangePercent, marketMomentum };
}

async function getMarketSnapshot(): Promise<MarketSnapshot> {
  if (marketSnapshotCache && Date.now() - marketSnapshotCache.ts < MARKET_SNAPSHOT_TTL) {
    return marketSnapshotCache.value;
  }

  const indices = await getMarketIndices();
  const value = summarizeMarketMomentum(indices);
  marketSnapshotCache = { ts: Date.now(), value };
  return value;
}

export async function analyzeStock(symbol: string): Promise<FullStockAnalysis> {
  const quote = await getStockQuote(symbol.toUpperCase());
  const ctx = await buildContext(quote);
  const weights = await getAgentWeights();

  const agents = [
    runFundamentalAgent(ctx),
    runTechnicalAgent(ctx),
    runRegimeAgent(ctx),
    runRiskAgent(ctx),
  ];

  const coordinator = runCoordinator(agents, weights, ctx);

  const analysis: FullStockAnalysis = {
    symbol: quote.symbol,
    name: quote.name,
    consensus: coordinator.consensus,
    consensusConfidence: coordinator.confidence,
    summaryEn: coordinator.summaryEn,
    summaryTr: coordinator.summaryTr,
    agents,
    coordinator,
    analyzedAt: new Date().toISOString(),
  };

  await recordPrediction(analysis, quote.price);
  return analysis;
}

export async function analyzeWatchlist(): Promise<FullStockAnalysis[]> {
  return Promise.all(DEFAULT_WATCHLIST.map((s) => analyzeStock(s.symbol)));
}

export async function generateDailyBriefing(): Promise<DailyBriefing> {
  const analyses = await analyzeWatchlist();
  return buildBriefingFromAnalyses(analyses);
}

export async function buildBriefingFromAnalyses(analyses: FullStockAnalysis[]): Promise<DailyBriefing> {
  const indices = await getMarketIndices();
  const spy = indices.find((i) => i.symbol === "SPY");

  const buys = analyses
    .filter((a) => a.consensus === "buy" && a.coordinator.approved)
    .sort((a, b) => b.consensusConfidence - a.consensusConfidence)
    .slice(0, 3)
    .map((a) => ({ symbol: a.symbol, confidence: a.consensusConfidence }));

  const sells = analyses
    .filter((a) => a.consensus === "sell")
    .sort((a, b) => b.consensusConfidence - a.consensusConfidence)
    .slice(0, 3)
    .map((a) => ({ symbol: a.symbol, confidence: a.consensusConfidence }));

  const holds = analyses.filter((a) => a.consensus === "hold").map((a) => a.symbol);
  const vetoed = analyses.filter((a) => !a.coordinator.approved).length;

  return {
    generatedAt: new Date().toISOString(),
    marketSummaryEn: `SPY ${spy?.changePercent != null && spy.changePercent >= 0 ? "+" : ""}${spy?.changePercent?.toFixed(2) ?? "0"}%. ${buys.length} buy signals, ${sells.length} sell signals across watchlist.`,
    marketSummaryTr: `SPY ${spy?.changePercent != null && spy.changePercent >= 0 ? "+" : ""}${spy?.changePercent?.toFixed(2) ?? "0"}%. İzleme listesinde ${buys.length} al, ${sells.length} sat sinyali.`,
    topBuys: buys,
    topSells: sells,
    holds,
    highlightsEn: [
      buys.length > 0 ? `Top pick: ${buys[0].symbol} (${(buys[0].confidence * 100).toFixed(0)}% confidence)` : "No strong buy signals today.",
      `${vetoed} symbols blocked by risk agent.`,
      `${analyses.filter((a) => a.coordinator.conflicts.length > 0).length} symbols with agent disagreement.`,
    ],
    highlightsTr: [
      buys.length > 0 ? `Öne çıkan: ${buys[0].symbol} (güven %${(buys[0].confidence * 100).toFixed(0)})` : "Bugün güçlü al sinyali yok.",
      `${vetoed} sembol risk agent tarafından engellendi.`,
      `${analyses.filter((a) => a.coordinator.conflicts.length > 0).length} sembolde agent görüş ayrılığı.`,
    ],
  };
}

export { getAccuracyStats, getAgentWeights };
