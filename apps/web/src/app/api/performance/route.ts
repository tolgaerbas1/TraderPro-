import { NextResponse } from "next/server";
import { broker } from "@/lib/broker/instance";
import {
  buildAllocation,
  buildPnLHistory,
  buildPositionPerformance,
  computeWinRate,
} from "@/lib/performance";
import type { PerformanceReport } from "@/types";

export async function GET() {
  const portfolio = await broker.getPortfolio();
  const closedTrades = await broker.getClosedTrades();
  const orders = await broker.getOrders();

  const history = buildPnLHistory(portfolio.totalValue, portfolio.totalCost);
  const allocation = buildAllocation(portfolio);
  const positionPerformance = await buildPositionPerformance(portfolio);

  const sorted = [...positionPerformance].sort(
    (a, b) => b.unrealizedPnLPercent - a.unrealizedPnLPercent
  );

  const lastPoint = history[history.length - 1];
  const benchmarkOutperformance =
    lastPoint.portfolioReturn - lastPoint.benchmarkReturn;

  const report: PerformanceReport = {
    portfolio,
    history,
    allocation,
    positionPerformance,
    closedTrades,
    winRate: computeWinRate(closedTrades),
    bestPerformer: sorted[0] ?? null,
    worstPerformer: sorted[sorted.length - 1] ?? null,
    benchmarkSymbol: "SPY",
    benchmarkOutperformance,
  };

  return NextResponse.json({ report, orders });
}
