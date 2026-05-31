"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/toast";
import type { PortfolioSummary, Order, ClosedTrade } from "@/types";

const COLORS = ["#059669", "#0ea5e9", "#8b5cf6", "#f59e0b"];

export default function PortfolioPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [form, setForm] = useState({ symbol: "AAPL", side: "buy" as "buy" | "sell", quantity: "1" });
  const [loading, setLoading] = useState(true);

  async function loadPortfolio() {
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setPortfolio(data.portfolio);
    setOrders(data.orders ?? []);
    setClosedTrades(data.closedTrades ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: form.symbol,
        side: form.side,
        quantity: Number(form.quantity),
        type: "market",
      }),
    });
    const data = await res.json();
    if (data.order) {
      toast(`${form.side === "buy" ? "Bought" : "Sold"} ${form.quantity} ${form.symbol} @ ${formatCurrency(data.order.fillPrice)}`);
    } else {
      toast("Order failed", "error");
    }
    loadPortfolio();
  }

  if (loading || !portfolio) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px]" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </AppShell>
    );
  }

  const allocation = portfolio.positions.map((p) => ({
    symbol: p.symbol,
    value: p.quantity * p.currentPrice,
  }));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.portfolio.title}</h1>
        <Link
          href="/performance"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          {t.portfolio.viewPerformance}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t.portfolio.totalValue} value={formatCurrency(portfolio.totalValue)} />
        <StatCard
          label={t.portfolio.unrealizedPnL}
          value={formatCurrency(portfolio.unrealizedPnL)}
          sub={`${portfolio.unrealizedPnLPercent >= 0 ? "+" : ""}${portfolio.unrealizedPnLPercent.toFixed(2)}%`}
          positive={portfolio.unrealizedPnL >= 0}
        />
        <StatCard
          label={t.portfolio.realizedPnL}
          value={formatCurrency(portfolio.realizedPnL)}
          positive={portfolio.realizedPnL >= 0}
        />
        <StatCard
          label={t.portfolio.totalPnL}
          value={formatCurrency(portfolio.totalPnL)}
          positive={portfolio.totalPnL >= 0}
        />
        <StatCard
          label={t.portfolio.dayChange}
          value={formatCurrency(portfolio.dayChange)}
          sub={`${portfolio.dayChangePercent >= 0 ? "+" : ""}${portfolio.dayChangePercent.toFixed(2)}%`}
          positive={portfolio.dayChange >= 0}
        />
        <StatCard
          label={t.portfolio.weekChange}
          value={formatCurrency(portfolio.weekChange)}
          sub={`${portfolio.weekChangePercent >= 0 ? "+" : ""}${portfolio.weekChangePercent.toFixed(2)}%`}
          positive={portfolio.weekChange >= 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t.portfolio.positions} className="lg:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">{t.portfolio.quantity}</th>
                <th className="pb-3 pr-4">{t.portfolio.avgCost}</th>
                <th className="pb-3 pr-4">{t.portfolio.currentPrice}</th>
                <th className="pb-3 pr-4">{t.portfolio.weight}</th>
                <th className="pb-3">{t.portfolio.pnl}</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.positions.map((p) => {
                const pnl = (p.currentPrice - p.avgCost) * p.quantity;
                const pnlPct = ((p.currentPrice - p.avgCost) / p.avgCost) * 100;
                const weight =
                  portfolio.totalValue > 0
                    ? ((p.quantity * p.currentPrice) / portfolio.totalValue) * 100
                    : 0;
                return (
                  <tr key={p.symbol} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 pr-4">
                      <Link href={`/stock/${p.symbol}`} className="font-medium text-emerald-600 hover:underline">
                        {p.symbol}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{p.quantity}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatCurrency(p.avgCost)}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatCurrency(p.currentPrice)}</td>
                    <td className="py-3 pr-4 tabular-nums">{weight.toFixed(1)}%</td>
                    <td className={`py-3 tabular-nums ${pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card title={t.portfolio.allocation}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title={t.portfolio.simulateOrder}>
            <form onSubmit={submitOrder} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Symbol</label>
                <input
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Side</label>
                <select
                  value={form.side}
                  onChange={(e) => setForm({ ...form, side: e.target.value as "buy" | "sell" })}
                  className="input-field w-full"
                >
                  <option value="buy">{t.portfolio.buy}</option>
                  <option value="sell">{t.portfolio.sell}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">{t.portfolio.quantity}</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <button type="submit" className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white">
                {t.portfolio.simulateOrder}
              </button>
            </form>
          </Card>
        </div>
      </div>

      {closedTrades.length > 0 && (
        <Card title={t.portfolio.closedTrades} className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">{t.portfolio.quantity}</th>
                <th className="pb-3 pr-4">{t.performance.buyPrice}</th>
                <th className="pb-3 pr-4">{t.performance.sellPrice}</th>
                <th className="pb-3">{t.portfolio.pnl}</th>
              </tr>
            </thead>
            <tbody>
              {closedTrades.slice(0, 5).map((trade) => (
                <tr key={trade.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 font-medium">{trade.symbol}</td>
                  <td className="py-2 pr-4">{trade.quantity}</td>
                  <td className="py-2 pr-4 tabular-nums">{formatCurrency(trade.avgCost)}</td>
                  <td className="py-2 pr-4 tabular-nums">{formatCurrency(trade.sellPrice)}</td>
                  <td className={`py-2 tabular-nums ${trade.realizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(trade.realizedPnL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {orders.length > 0 && (
        <Card title={t.portfolio.recentOrders} className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">Side</th>
                <th className="pb-3 pr-4">{t.portfolio.quantity}</th>
                <th className="pb-3 pr-4">Fill</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 font-medium">{o.symbol}</td>
                  <td className="py-2 pr-4 uppercase">{o.side}</td>
                  <td className="py-2 pr-4">{o.quantity}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    {o.fillPrice ? formatCurrency(o.fillPrice) : "—"}
                  </td>
                  <td className="py-2 text-xs text-zinc-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
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
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
