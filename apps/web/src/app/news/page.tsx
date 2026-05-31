"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { impactLabel, impactColor } from "@/lib/news/sentiment";
import type { NewsItem } from "@/lib/news/types";
import { Newspaper, ExternalLink } from "lucide-react";

const SYMBOLS = ["ALL", "NVDA", "AAPL", "MSFT", "AMZN", "META", "TSLA", "GOOGL", "AVGO", "TSM", "MU"];

export default function NewsPage() {
  const { t, lang } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filtered, setFiltered] = useState<NewsItem[]>([]);
  const [symbolFilter, setSymbolFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => {
        setNews(d.items ?? []);
        setFiltered(d.items ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let items = news;
    if (symbolFilter !== "ALL") items = items.filter((n) => n.symbol === symbolFilter);
    if (sentimentFilter !== "all") items = items.filter((n) => n.sentiment === sentimentFilter);
    setFiltered(items);
  }, [symbolFilter, sentimentFilter, news]);

  const hasAlert = filtered.filter((n) => n.sentiment !== "neutral").length;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-emerald-600" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Haber Akışı" : "News Feed"}</h1>
        </div>
        {hasAlert > 0 && (
          <Badge variant="info">{hasAlert} {lang === "tr" ? "etkili haber" : "impactful news"}</Badge>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          className="input-field w-auto"
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? (lang === "tr" ? "Tüm Hisseler" : "All Stocks") : s}</option>
          ))}
        </select>
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">{lang === "tr" ? "Tüm Etkiler" : "All Impact"}</option>
          <option value="positive">{lang === "tr" ? "Pozitif" : "Positive"}</option>
          <option value="negative">{lang === "tr" ? "Negatif" : "Negative"}</option>
          <option value="neutral">{lang === "tr" ? "Nötr" : "Neutral"}</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="text-zinc-500">
            {lang === "tr" ? "Bu filtrelerle eşleşen haber yok." : "No news matching these filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="transition-colors hover:border-emerald-300 dark:hover:border-emerald-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    >
                      {item.symbol}
                    </Link>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(item.publishedAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-medium">{lang === "tr" ? item.titleTr : item.titleEn}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${impactColor(item.impactScore)}`}>
                    {impactLabel(item.impactScore, lang)}
                  </span>
                  <a
                    href={item.url === "#" ? undefined : item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
