"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, ChangeCell, ConsensusBadge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockQuote, StockAnalysis } from "@/types";

export default function WatchlistPage() {
  const { t, lang } = useLanguage();
  const [rows, setRows] = useState<{ quote: StockQuote; analysis: StockAnalysis }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/radar")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.results ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">{t.watchlist.title}</h1>
      <Card>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                  <th className="pb-3 pr-4">{t.watchlist.symbol}</th>
                  <th className="pb-3 pr-4">{t.watchlist.price}</th>
                  <th className="pb-3 pr-4">{t.watchlist.dayChange}</th>
                  <th className="pb-3 pr-4">{t.watchlist.weekChange}</th>
                  <th className="pb-3 pr-4">{t.watchlist.marketCap}</th>
                  <th className="pb-3 pr-4">{t.watchlist.pe}</th>
                  <th className="pb-3 pr-4">{t.watchlist.sector}</th>
                  <th className="pb-3">{t.watchlist.consensus}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ quote, analysis }) => (
                  <tr
                    key={quote.symbol}
                    className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="py-3 pr-4">
                      <Link href={`/stock/${quote.symbol}`} className="font-medium text-emerald-600 hover:underline">
                        {quote.symbol}
                      </Link>
                      <div className="text-xs text-zinc-500">{quote.name}</div>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{formatCurrency(quote.price)}</td>
                    <td className="py-3 pr-4"><ChangeCell value={quote.changePercent} /></td>
                    <td className="py-3 pr-4"><ChangeCell value={quote.changeWeek} /></td>
                    <td className="py-3 pr-4 tabular-nums">{formatNumber(quote.marketCap)}</td>
                    <td className="py-3 pr-4 tabular-nums">{quote.pe?.toFixed(1) ?? "—"}</td>
                    <td className="py-3 pr-4 text-zinc-600">{quote.sector}</td>
                    <td className="py-3">
                      <ConsensusBadge action={analysis.consensus} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
