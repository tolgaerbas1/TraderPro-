"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, ChangeCell } from "@/components/ui/card";
import { AgentPanel } from "@/components/agents/agent-panel";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { StockQuote, StockAnalysis } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const [symbol, setSymbol] = useState("");
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    params.then((p) => {
      setSymbol(p.symbol.toUpperCase());
      fetch(`/api/stocks/${p.symbol}`)
        .then((r) => r.json())
        .then((d) => {
          setQuote(d.quote);
          setAnalysis(d.analysis);
        });
    });
  }, [params]);

  if (!quote || !analysis) {
    return (
      <AppShell>
        <p className="text-zinc-500">Loading {symbol}...</p>
      </AppShell>
    );
  }

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: quote.price * (0.92 + Math.random() * 0.16 + (i / 30) * 0.05),
  }));

  return (
    <AppShell>
      <div className="mb-4 flex gap-4">
        <Link href="/watchlist" className="text-sm text-emerald-600 hover:underline">
          ← {t.watchlist.title}
        </Link>
        <Link href="/agents" className="text-sm text-emerald-600 hover:underline">
          {t.dashboard.viewAgents}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{quote.symbol}</h1>
          <p className="text-zinc-500">{quote.name} · {quote.exchange}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums">{formatCurrency(quote.price)}</div>
          <ChangeCell value={quote.changePercent} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat label={t.stock.high52w} value={formatCurrency(quote.high52w)} />
        <MiniStat label={t.stock.low52w} value={formatCurrency(quote.low52w)} />
        <MiniStat label={t.stock.volume} value={formatNumber(quote.volume)} />
        <MiniStat label={t.watchlist.pe} value={quote.pe?.toFixed(1) ?? "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t.stock.chart} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" hide />
              <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="lg:col-span-1">
          <AgentPanel analysis={analysis} />
        </div>
      </div>

      <Card title={t.stock.fundamentals} className="mt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MiniStat label="P/E" value={quote.pe?.toFixed(1) ?? "—"} />
          <MiniStat label="P/B" value={quote.pb?.toFixed(1) ?? "—"} />
          <MiniStat label="ROE" value={quote.roe ? `${quote.roe.toFixed(1)}%` : "—"} />
          <MiniStat label={t.watchlist.sector} value={quote.sector} />
        </div>
      </Card>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
