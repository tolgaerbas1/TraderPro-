"use client";

import Link from "next/link";
import { Card, ChangeCell, ConsensusBadge, Badge } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockQuote, StockAnalysis, MarketIndex } from "@/types";
import type { NewsItem } from "@/lib/news/types";
import type { Investor } from "@/lib/investors/data";
import type { EarningsEvent } from "@/lib/earnings/data";
import { impactLabel, impactColor } from "@/lib/news/sentiment";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

export function MarketSummaryWidget({ indices }: { indices: MarketIndex[] }) {
  const { t } = useLanguage();
  return (
    <Card title={t.dashboard.marketSummary}>
      <div className="grid grid-cols-3 gap-3">
        {indices.map((idx) => (
          <div key={idx.symbol} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">{idx.symbol}</div>
            <div className="text-lg font-semibold tabular-nums">{formatCurrency(idx.price)}</div>
            <ChangeCell value={idx.changePercent} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WatchlistWidget({ quotes }: { quotes: StockQuote[] }) {
  const { t } = useLanguage();
  return (
    <Card
      title={t.dashboard.watchlist}
      action={
        <Link href="/watchlist" className="text-xs text-emerald-600 hover:underline">
          {t.dashboard.viewAll}
        </Link>
      }
    >
      <div className="space-y-2">
        {quotes.slice(0, 6).map((q) => (
          <Link
            key={q.symbol}
            href={`/stock/${q.symbol}`}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div>
              <span className="font-medium">{q.symbol}</span>
              <span className="ml-2 text-xs text-zinc-500">{q.exchange}</span>
            </div>
            <div className="text-right">
              <div className="text-sm tabular-nums">{formatCurrency(q.price)}</div>
              <ChangeCell value={q.changePercent} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function AgentConsensusWidget({
  analyses,
}: {
  analyses: { quote: StockQuote; analysis: StockAnalysis }[];
}) {
  const { t, lang } = useLanguage();
  const buys = analyses.filter((a) => a.analysis.consensus === "buy");
  const holds = analyses.filter((a) => a.analysis.consensus === "hold");
  const sells = analyses.filter((a) => a.analysis.consensus === "sell");

  return (
    <Card title={t.dashboard.agentConsensus}>
      <div className="space-y-3">
        {[
          { label: t.consensus.buy, items: buys, variant: "success" as const },
          { label: t.consensus.hold, items: holds, variant: "warning" as const },
          { label: t.consensus.sell, items: sells, variant: "danger" as const },
        ].map(({ label, items }) => (
          <div key={label}>
            <div className="mb-1 text-xs font-medium text-zinc-500">{label}</div>
            <div className="flex flex-wrap gap-2">
              {items.length === 0 ? (
                <span className="text-xs text-zinc-400">—</span>
              ) : (
                items.map(({ quote, analysis }) => (
                  <Link key={quote.symbol} href={`/stock/${quote.symbol}`}>
                    <ConsensusBadge action={analysis.consensus} lang={lang} />
                    <span className="ml-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {quote.symbol}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RadarPreviewWidget({
  matchCount,
}: {
  matchCount: number;
}) {
  const { t } = useLanguage();
  return (
    <Card title={t.dashboard.radarPreview}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        {matchCount} {t.radar.matches}
      </p>
      <Link
        href="/radar"
        className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {t.dashboard.runRadar}
      </Link>
    </Card>
  );
}

export function PortfolioWidget({
  totalValue,
  unrealizedPnL,
  unrealizedPnLPercent,
  totalPnL,
}: {
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  totalPnL?: number;
}) {
  const { t } = useLanguage();
  return (
    <Card
      title={t.dashboard.portfolioPnL}
      action={
        <Link href="/portfolio" className="text-xs text-emerald-600 hover:underline">
          {t.dashboard.viewAll}
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-zinc-500">{t.portfolio.totalValue}</div>
          <div className="text-xl font-bold tabular-nums">{formatCurrency(totalValue)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">{t.portfolio.unrealizedPnL}</div>
          <div className={`text-xl font-bold tabular-nums ${unrealizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(unrealizedPnL)} ({unrealizedPnLPercent >= 0 ? "+" : ""}
            {unrealizedPnLPercent.toFixed(2)}%)
          </div>
        </div>
        {totalPnL != null && (
          <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
            <div className="text-xs text-zinc-500">{t.portfolio.totalPnL}</div>
            <div className={`font-semibold tabular-nums ${totalPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(totalPnL)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function DailyBriefingWidget({ briefing }: { briefing: import("@/lib/agents/types").DailyBriefing }) {
  const { t, lang, bilingual } = useLanguage();
  const summary = bilingual
    ? `${briefing.marketSummaryTr} / ${briefing.marketSummaryEn}`
    : lang === "tr"
      ? briefing.marketSummaryTr
      : briefing.marketSummaryEn;

  return (
    <Card
      title={t.dashboard.dailyBriefing}
      action={
        <Link href="/agents" className="text-xs text-emerald-600 hover:underline">
          {t.dashboard.viewAgents}
        </Link>
      }
    >
      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">{summary}</p>
      <div className="flex flex-wrap gap-2">
        {briefing.topBuys.slice(0, 2).map((b) => (
          <Link key={b.symbol} href={`/stock/${b.symbol}`}>
            <Badge variant="success">{b.symbol}</Badge>
          </Link>
        ))}
        {briefing.topSells.slice(0, 1).map((s) => (
          <Link key={s.symbol} href={`/stock/${s.symbol}`}>
            <Badge variant="danger">{s.symbol}</Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function TopMoversWidget({ quotes }: { quotes: StockQuote[] }) {
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <Card title="Top Movers">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 text-xs font-medium text-emerald-600">Gainers</div>
          {gainers.map((q) => (
            <Link key={q.symbol} href={`/stock/${q.symbol}`} className="flex justify-between py-1 text-sm">
              <span>{q.symbol}</span>
              <ChangeCell value={q.changePercent} />
            </Link>
          ))}
        </div>
        <div>
          <div className="mb-2 text-xs font-medium text-red-600">Losers</div>
          {losers.map((q) => (
            <Link key={q.symbol} href={`/stock/${q.symbol}`} className="flex justify-between py-1 text-sm">
              <span>{q.symbol}</span>
              <ChangeCell value={q.changePercent} />
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function NewsFeedWidget({ news }: { news: NewsItem[] }) {
  const { lang } = useLanguage();
  return (
    <Card
      title={lang === "tr" ? "Son Haberler" : "Latest News"}
      action={
        <Link href="/news" className="text-xs text-emerald-600 hover:underline">
          {lang === "tr" ? "Tümü" : "View all"}
        </Link>
      }
    >
      <div className="space-y-2.5">
        {news.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href={`/stock/${item.symbol}`}
            className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <span className={`mt-0.5 shrink-0 rounded px-1 py-0.5 text-[10px] font-medium ${impactColor(item.impactScore)}`}>
              {impactLabel(item.impactScore, lang).split(" ")[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs">{lang === "tr" ? item.titleTr : item.titleEn}</p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="rounded bg-emerald-100 px-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {item.symbol}
                </span>
                <span>{item.source}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function InvestorsWidget({ investors }: { investors: Array<{ id: string; name: string; firm: string; topSymbol: string | null }> }) {
  const { lang } = useLanguage();
  return (
    <Card
      title={lang === "tr" ? "Ünlü Yatırımcılar" : "Famous Investors"}
      action={
        <Link href="/investors" className="text-xs text-emerald-600 hover:underline">
          {lang === "tr" ? "Tümü" : "View all"}
        </Link>
      }
    >
      <div className="space-y-2">
        {investors.slice(0, 4).map((inv) => (
          <Link
            key={inv.id}
            href={`/investors/${inv.id}`}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div>
              <span className="text-sm font-medium">{inv.name}</span>
              <div className="text-[10px] text-zinc-400">{inv.firm}</div>
            </div>
            {inv.topSymbol && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                {inv.topSymbol}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function EarningsWidget({ events }: { events: EarningsEvent[] }) {
  const { lang } = useLanguage();
  return (
    <Card
      title={lang === "tr" ? "Kazanç Takvimi" : "Earnings Calendar"}
      action={
        <Link href="/earnings" className="text-xs text-emerald-600 hover:underline">
          {lang === "tr" ? "Tümü" : "View all"}
        </Link>
      }
    >
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-xs text-zinc-400">{lang === "tr" ? "Bu hafta kazanç yok" : "No earnings this week"}</p>
        ) : (
          events.slice(0, 4).map((e) => (
            <Link
              key={`${e.symbol}-${e.date}`}
              href={`/stock/${e.symbol}`}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div>
                <span className="text-sm font-medium">{e.symbol}</span>
                <div className="text-[10px] text-zinc-400">{e.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs tabular-nums">
                  {new Date(e.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}
                </div>
                <Badge variant={e.time === "pre" ? "info" : "warning"}>
                  {e.time === "pre" ? (lang === "tr" ? "Açılış Öncesi" : "Pre-market") : (lang === "tr" ? "Kapanış Sonrası" : "After-close")}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
