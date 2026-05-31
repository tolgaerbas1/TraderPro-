import type {
  AllocationSlice,
  ClosedTrade,
  PnLHistoryPoint,
  PortfolioSummary,
  PositionPerformance,
} from "@/types";
import { getStockQuote } from "./market-data";

/** Generate 30-day portfolio vs SPY benchmark history (mock, seeded from current value) */
export function buildPnLHistory(
  currentValue: number,
  totalCost: number,
  days = 30
): PnLHistoryPoint[] {
  const points: PnLHistoryPoint[] = [];
  let portfolio = totalCost * 0.92;
  let benchmark = totalCost * 0.91;
  const drift = (currentValue - portfolio) / days;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const noise = Math.sin(i * 0.7) * 0.008 + (Math.random() - 0.5) * 0.004;
    portfolio = i === 0 ? currentValue : portfolio * (1 + drift / currentValue + noise);
    benchmark = benchmark * (1 + 0.0003 + noise * 0.6);

    points.push({
      date: date.toISOString().slice(0, 10),
      portfolioValue: Math.round(portfolio * 100) / 100,
      benchmarkValue: Math.round(benchmark * 100) / 100,
      portfolioReturn: ((portfolio - totalCost) / totalCost) * 100,
      benchmarkReturn: ((benchmark - totalCost) / totalCost) * 100,
    });
  }
  points[points.length - 1].portfolioValue = currentValue;
  return points;
}

export function buildAllocation(portfolio: PortfolioSummary): AllocationSlice[] {
  return portfolio.positions
    .map((p) => ({
      symbol: p.symbol,
      value: p.quantity * p.currentPrice,
      weight: portfolio.totalValue > 0 ? (p.quantity * p.currentPrice) / portfolio.totalValue : 0,
    }))
    .sort((a, b) => b.weight - a.weight);
}

export async function buildPositionPerformance(
  portfolio: PortfolioSummary
): Promise<PositionPerformance[]> {
  return Promise.all(
    portfolio.positions.map(async (p) => {
      let dayChangePercent = 0;
      try {
        const quote = await getStockQuote(p.symbol);
        dayChangePercent = quote.changePercent;
      } catch {
        /* fallback */
      }
      const marketValue = p.quantity * p.currentPrice;
      const costBasis = p.quantity * p.avgCost;
      const unrealizedPnL = marketValue - costBasis;
      return {
        symbol: p.symbol,
        quantity: p.quantity,
        marketValue,
        costBasis,
        unrealizedPnL,
        unrealizedPnLPercent: costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0,
        dayChangePercent,
        weight: portfolio.totalValue > 0 ? marketValue / portfolio.totalValue : 0,
      };
    })
  );
}

export function computeWinRate(closedTrades: ClosedTrade[]): number {
  if (closedTrades.length === 0) return 0;
  const wins = closedTrades.filter((t) => t.realizedPnL > 0).length;
  return (wins / closedTrades.length) * 100;
}
