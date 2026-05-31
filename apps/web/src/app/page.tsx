import { AppShell } from "@/components/layout/sidebar";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { getWatchlistQuotes, getMarketIndices, runRadarScan } from "@/lib/market-data";
import { analyzeWatchlist, buildBriefingFromAnalyses } from "@/lib/agents/engine";
import { broker } from "@/lib/broker/instance";

async function getDashboardData() {
  const [quotes, indices, radarResults, fullAnalyses] = await Promise.all([
    getWatchlistQuotes(),
    getMarketIndices(),
    runRadarScan({ roeMin: 10 }),
    analyzeWatchlist(),
  ]);

  const analyses = fullAnalyses.map((full) => ({
    quote: quotes.find((q) => q.symbol === full.symbol)!,
    analysis: {
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
    },
  }));

  const briefing = await buildBriefingFromAnalyses(fullAnalyses);
  const portfolio = await broker.getPortfolio();

  return {
    quotes,
    indices,
    analyses,
    briefing,
    radarCount: radarResults.length,
    portfolio: {
      totalValue: portfolio.totalValue,
      unrealizedPnL: portfolio.unrealizedPnL,
      unrealizedPnLPercent: portfolio.unrealizedPnLPercent,
      totalPnL: portfolio.totalPnL,
    },
  };
}

export default async function HomePage() {
  const data = await getDashboardData();
  return (
    <AppShell>
      <DashboardGrid data={data} />
    </AppShell>
  );
}
