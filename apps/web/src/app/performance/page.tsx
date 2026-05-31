"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { exportTradesCsv } from "@/lib/export-csv";
import type { PerformanceReport, Order } from "@/types";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#059669", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

export default function PerformancePage() {
  const { t } = useLanguage();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<"1W" | "1M" | "ALL">("1M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/performance")
      .then((r) => r.json())
      .then((d) => {
        setReport(d.report);
        setOrders(d.orders ?? []);
        setLoading(false);
      });
  }, []);

  function exportCsv() {
    if (!report) return;
    const csv = exportTradesCsv(orders, report.closedTrades);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traderpro-trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !report) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-[380px] lg:col-span-2" />
            <Skeleton className="h-[380px]" />
          </div>
        </div>
      </AppShell>
    );
  }

  const { portfolio } = report;
  const filteredHistory =
    period === "1W"
      ? report.history.slice(-7)
      : period === "1M"
        ? report.history.slice(-30)
        : report.history;

  const contributionData = report.positionPerformance.map((p) => ({
    symbol: p.symbol,
    pnl: p.unrealizedPnL,
  }));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.performance.title}</h1>
        <div className="flex gap-2">
          {(["1W", "1M", "ALL"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                period === p
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Stat label={t.portfolio.totalValue} value={formatCurrency(portfolio.totalValue)} />
        <Stat
          label={t.performance.unrealized}
          value={formatCurrency(portfolio.unrealizedPnL)}
          positive={portfolio.unrealizedPnL >= 0}
        />
        <Stat
          label={t.performance.realized}
          value={formatCurrency(portfolio.realizedPnL)}
          positive={portfolio.realizedPnL >= 0}
        />
        <Stat
          label={t.performance.totalPnL}
          value={formatCurrency(portfolio.totalPnL)}
          positive={portfolio.totalPnL >= 0}
        />
        <Stat label={t.performance.winRate} value={`${report.winRate.toFixed(0)}%`} />
        <Stat
          label={`vs ${report.benchmarkSymbol}`}
          value={formatPercent(report.benchmarkOutperformance)}
          positive={report.benchmarkOutperformance >= 0}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t.performance.portfolioVsBenchmark} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredHistory}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                width={55}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={(l) => String(l)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                name={t.performance.portfolio}
                stroke="#059669"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="benchmarkValue"
                name={report.benchmarkSymbol}
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t.performance.allocation}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report.allocation}
                dataKey="value"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {report.allocation.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t.performance.contribution}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={contributionData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="symbol" width={50} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="pnl" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t.performance.topPerformers}>
          <div className="grid grid-cols-2 gap-4">
            {report.bestPerformer && (
              <PerformerCard
                label={t.performance.best}
                symbol={report.bestPerformer.symbol}
                pnl={report.bestPerformer.unrealizedPnL}
                pnlPct={report.bestPerformer.unrealizedPnLPercent}
                positive
              />
            )}
            {report.worstPerformer && (
              <PerformerCard
                label={t.performance.worst}
                symbol={report.worstPerformer.symbol}
                pnl={report.worstPerformer.unrealizedPnL}
                pnlPct={report.worstPerformer.unrealizedPnLPercent}
                positive={report.worstPerformer.unrealizedPnL >= 0}
              />
            )}
          </div>
          <div className="mt-4 space-y-2">
            {report.positionPerformance
              .sort((a, b) => b.unrealizedPnLPercent - a.unrealizedPnLPercent)
              .map((p) => (
                <Link
                  key={p.symbol}
                  href={`/stock/${p.symbol}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="font-medium">{p.symbol}</span>
                  <span className="text-xs text-zinc-500">{(p.weight * 100).toFixed(1)}%</span>
                  <span
                    className={`tabular-nums text-sm ${p.unrealizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatPercent(p.unrealizedPnLPercent)}
                  </span>
                </Link>
              ))}
          </div>
        </Card>
      </div>

      <Card title={t.performance.tradeJournal}>
        {report.closedTrades.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.performance.noClosedTrades}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4">{t.performance.date}</th>
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">{t.portfolio.quantity}</th>
                <th className="pb-3 pr-4">{t.performance.buyPrice}</th>
                <th className="pb-3 pr-4">{t.performance.sellPrice}</th>
                <th className="pb-3">{t.portfolio.pnl}</th>
              </tr>
            </thead>
            <tbody>
              {report.closedTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 text-xs text-zinc-500">
                    {new Date(trade.closedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4 font-medium">{trade.symbol}</td>
                  <td className="py-2 pr-4">{trade.quantity}</td>
                  <td className="py-2 pr-4 tabular-nums">{formatCurrency(trade.avgCost)}</td>
                  <td className="py-2 pr-4 tabular-nums">{formatCurrency(trade.sellPrice)}</td>
                  <td
                    className={`py-2 tabular-nums ${trade.realizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatCurrency(trade.realizedPnL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div
        className={`mt-1 text-lg font-bold tabular-nums ${
          positive === true ? "text-emerald-600" : positive === false ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PerformerCard({
  label,
  symbol,
  pnl,
  pnlPct,
  positive,
}: {
  label: string;
  symbol: string;
  pnl: number;
  pnlPct: number;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
        {positive ? (
          <TrendingUp className="h-3 w-3 text-emerald-600" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-600" />
        )}
        {label}
      </div>
      <div className="font-bold">{symbol}</div>
      <div className={`text-sm tabular-nums ${positive ? "text-emerald-600" : "text-red-600"}`}>
        {formatCurrency(pnl)} ({formatPercent(pnlPct)})
      </div>
    </div>
  );
}
