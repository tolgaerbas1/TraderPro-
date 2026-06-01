"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, ChangeCell, ConsensusBadge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockQuote, StockAnalysis } from "@/types";

type WatchlistTab = "top10" | "nyse" | "custom";

const STORAGE_KEY = "traderpro-custom-watchlist";

function loadCustom(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCustom(symbols: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
}

export default function WatchlistPage() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [rows, setRows] = useState<{ quote: StockQuote; analysis: StockAnalysis }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<WatchlistTab>("top10");
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);
  const [newSymbol, setNewSymbol] = useState("");

  useEffect(() => {
    setCustomSymbols(loadCustom());
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = tab === "nyse" ? "?list=nyse" : tab === "custom" && customSymbols.length > 0 ? `?symbols=${customSymbols.join(",")}` : "";
    fetch(`/api/radar${params}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.results ?? []);
        setLoading(false);
      });
  }, [tab, customSymbols]);

  function addCustom() {
    const sym = newSymbol.toUpperCase().trim();
    if (!sym || customSymbols.includes(sym)) return;
    const updated = [...customSymbols, sym];
    setCustomSymbols(updated);
    saveCustom(updated);
    setNewSymbol("");
    toast(`${sym} eklendi`);
  }

  function removeCustom(symbol: string) {
    const updated = customSymbols.filter((s) => s !== symbol);
    setCustomSymbols(updated);
    saveCustom(updated);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.watchlist.title}</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {([
            { key: "top10", label: lang === "tr" ? "Top 10" : "Top 10" },
            { key: "nyse", label: lang === "tr" ? "NYSE Devleri" : "NYSE Giants" },
            { key: "custom", label: lang === "tr" ? "Özel" : "Custom" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "custom" && (
        <div className="mb-4 flex gap-2">
          <input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            className="input-field w-32"
            placeholder="AAPL"
          />
          <button onClick={addCustom} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            {lang === "tr" ? "Ekle" : "Add"}
          </button>
          {customSymbols.length > 0 && (
            <span className="self-center text-xs text-zinc-500">
              {customSymbols.length} {lang === "tr" ? "sembol" : "symbols"}
            </span>
          )}
        </div>
      )}
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
