import type { StockAnalysis, StockQuote, ConsensusAction } from "@/types";
import { analyzeStock } from "@/lib/agents/engine";
import { DEFAULT_WATCHLIST } from "./stocks";

/** Fallback quotes when live data unavailable */
const MOCK_BASE: Record<string, Partial<StockQuote>> = {
  NVDA: { price: 135.5, changePercent: 1.45, changeWeek: 3.2, pe: 45, roe: 115, pb: 25 },
  GOOGL: { price: 176.2, changePercent: 0.82, changeWeek: 2.1, pe: 24, roe: 28, pb: 6.5 },
  AAPL: { price: 228.4, changePercent: -0.31, changeWeek: 1.8, pe: 32, roe: 145, pb: 45 },
  MSFT: { price: 415.0, changePercent: 0.55, changeWeek: -0.5, pe: 35, roe: 38, pb: 12 },
  AMZN: { price: 198.3, changePercent: 1.12, changeWeek: 4.5, pe: 42, roe: 22, pb: 8 },
  TSM: { price: 185.0, changePercent: 0.95, changeWeek: 2.8, pe: 28, roe: 32, pb: 7 },
  AVGO: { price: 168.5, changePercent: 2.1, changeWeek: 5.2, pe: 38, roe: 45, pb: 9 },
  TSLA: { price: 248.0, changePercent: -1.2, changeWeek: -3.5, pe: 65, roe: 18, pb: 12 },
  META: { price: 585.0, changePercent: 0.44, changeWeek: 1.2, pe: 26, roe: 35, pb: 8 },
  MU: { price: 98.5, changePercent: 3.2, changeWeek: 8.5, pe: 18, roe: 12, pb: 2.5 },
  SPY: { price: 580.0, changePercent: 0.35, changeWeek: 1.1, pe: null, roe: null, pb: null },
  QQQ: { price: 505.0, changePercent: 0.52, changeWeek: 1.4, pe: null, roe: null, pb: null },
  DIA: { price: 425.0, changePercent: 0.28, changeWeek: 0.9, pe: null, roe: null, pb: null },
};

function metaFor(symbol: string) {
  return DEFAULT_WATCHLIST.find((s) => s.symbol === symbol) ?? {
    symbol,
    name: symbol,
    exchange: "NASDAQ" as const,
    sector: "Technology",
  };
}

function buildQuote(symbol: string, live?: Partial<StockQuote>): StockQuote {
  const meta = metaFor(symbol);
  const mock = MOCK_BASE[symbol] ?? { price: 100, changePercent: 0, changeWeek: 0, pe: 20, roe: 15, pb: 3 };
  const price = live?.price ?? mock.price ?? 100;
  const changePercent = live?.changePercent ?? mock.changePercent ?? 0;

  return {
    symbol,
    name: meta.name,
    exchange: meta.exchange,
    sector: meta.sector,
    price,
    change: price * (changePercent / 100),
    changePercent,
    changeWeek: live?.changeWeek ?? mock.changeWeek ?? 0,
    changeMonth: live?.changeMonth ?? (mock.changeWeek ?? 0) * 2,
    volume: live?.volume ?? 15_000_000,
    marketCap: live?.marketCap ?? price * 1e9,
    pe: live?.pe ?? mock.pe ?? null,
    pb: live?.pb ?? mock.pb ?? null,
    roe: live?.roe ?? mock.roe ?? null,
    dividendYield: live?.dividendYield ?? null,
    high52w: live?.high52w ?? price * 1.15,
    low52w: live?.low52w ?? price * 0.75,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchYahooQuote(symbol: string): Promise<Partial<StockQuote> | null> {
  try {
    const yahooFinance = await import("yahoo-finance2");
    const mod = yahooFinance.default ?? yahooFinance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = (await mod.quote(symbol)) as any;

    if (!quote?.regularMarketPrice) return null;

    return {
      price: quote.regularMarketPrice as number,
      changePercent: (quote.regularMarketChangePercent as number) ?? 0,
      changeWeek: undefined,
      volume: quote.regularMarketVolume as number | undefined,
      marketCap: quote.marketCap as number | undefined,
      pe: (quote.trailingPE as number) ?? null,
      pb: (quote.priceToBook as number) ?? null,
      high52w: quote.fiftyTwoWeekHigh as number | undefined,
      low52w: quote.fiftyTwoWeekLow as number | undefined,
    };
  } catch {
    return null;
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const live = await fetchYahooQuote(symbol);
  return buildQuote(symbol, live ?? undefined);
}

export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  return Promise.all(symbols.map(getStockQuote));
}

export async function getWatchlistQuotes(): Promise<StockQuote[]> {
  return getStockQuotes(DEFAULT_WATCHLIST.map((s) => s.symbol));
}

export async function getMarketIndices() {
  const indices = [
    { symbol: "SPY", name: "S&P 500 ETF" },
    { symbol: "QQQ", name: "Nasdaq 100 ETF" },
    { symbol: "DIA", name: "Dow Jones ETF" },
  ];
  const quotes = await getStockQuotes(indices.map((i) => i.symbol));
  return indices.map((idx, i) => ({
    ...idx,
    price: quotes[i].price,
    changePercent: quotes[i].changePercent,
  }));
}


function toStockAnalysis(full: Awaited<ReturnType<typeof analyzeStock>>): StockAnalysis {
  return {
    symbol: full.symbol,
    name: full.name,
    consensus: full.consensus,
    consensusConfidence: full.consensusConfidence,
    summaryEn: full.summaryEn,
    summaryTr: full.summaryTr,
    agents: full.agents,
    coordinator: {
      approved: full.coordinator.approved,
      suggestedPositionPct: full.coordinator.suggestedPositionPct,
      conflicts: full.coordinator.conflicts,
      vetoReason: full.coordinator.vetoReason,
    },
    analyzedAt: full.analyzedAt,
  };
}

export async function getStockAnalysis(symbol: string): Promise<StockAnalysis> {
  const full = await analyzeStock(symbol);
  return toStockAnalysis(full);
}

export async function runRadarScan(filters: {
  peMax?: number;
  peMin?: number;
  roeMin?: number;
  changeDayMin?: number;
  changeWeekMin?: number;
  sector?: string;
  consensus?: ConsensusAction;
}) {
  let quotes = await getWatchlistQuotes();

  if (filters.sector) {
    quotes = quotes.filter((q) => q.sector === filters.sector);
  }
  if (filters.peMax != null) {
    quotes = quotes.filter((q) => q.pe != null && q.pe <= filters.peMax!);
  }
  if (filters.peMin != null) {
    quotes = quotes.filter((q) => q.pe != null && q.pe >= filters.peMin!);
  }
  if (filters.roeMin != null) {
    quotes = quotes.filter((q) => q.roe != null && q.roe >= filters.roeMin!);
  }
  if (filters.changeDayMin != null) {
    quotes = quotes.filter((q) => q.changePercent >= filters.changeDayMin!);
  }
  if (filters.changeWeekMin != null) {
    quotes = quotes.filter((q) => q.changeWeek >= filters.changeWeekMin!);
  }

  const results = await Promise.all(
    quotes.map(async (q) => {
      const analysis = await getStockAnalysis(q.symbol);
      return { quote: q, analysis };
    })
  );

  if (filters.consensus) {
    return results.filter((r) => r.analysis.consensus === filters.consensus);
  }

  return results;
}

export async function getPriceMap(): Promise<Record<string, number>> {
  const quotes = await getWatchlistQuotes();
  return Object.fromEntries(quotes.map((q) => [q.symbol, q.price]));
}
