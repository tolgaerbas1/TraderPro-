"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { INVESTORS, type Investor } from "@/lib/investors/data";
import { TrendingUp, TrendingDown, ArrowLeft, ArrowRight } from "lucide-react";

const COLORS = ["#059669", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function InvestorDetailPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = String(params.name);
    const found = INVESTORS.find((i) => i.id === id) ?? null;
    setInvestor(found);
    setLoading(false);
  }, [params.name]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!investor) {
    return (
      <AppShell>
        <p className="text-zinc-500">{lang === "tr" ? "Yatırımcı bulunamadı." : "Investor not found."}</p>
      </AppShell>
    );
  }

  const pieData = investor.topHoldings.map((h) => ({
    name: h.symbol,
    value: h.value,
    weight: h.weight,
  }));

  const barData = investor.topHoldings.map((h) => ({
    symbol: h.symbol,
    weight: h.weight,
  }));

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/investors" className="text-sm text-emerald-600 hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" />
          {lang === "tr" ? "Tüm Yatırımcılar" : "All Investors"}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{investor.name}</h1>
          <p className="text-zinc-500">{investor.firm}</p>
        </div>
        <Badge variant="info">{investor.style}</Badge>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "Portföy Değeri" : "Portfolio Value"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">
            {formatCurrency(investor.totalPortfolioValue)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "Pozisyon Sayısı" : "Holdings"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{investor.topHoldings.length}+</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "En Büyük Pozisyon" : "Top Holding"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{investor.topHoldings[0]?.symbol}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "Konsantrasyon" : "Concentration"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">
            {investor.topHoldings.slice(0, 3).reduce((s, h) => s + h.weight, 0).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Card title={lang === "tr" ? "Hakkında" : "About"}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {lang === "tr" ? investor.bioTr : investor.bioEn}
          </p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={lang === "tr" ? "Portföy Dağılımı" : "Portfolio Allocation"}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title={lang === "tr" ? "Ağırlık Dağılımı" : "Weight Distribution"}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <YAxis type="category" dataKey="symbol" width={50} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-6">
        <Card title={lang === "tr" ? "Son Hareketler" : "Recent Moves"}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {lang === "tr" ? investor.recentMovesTr : investor.recentMovesEn}
          </p>
        </Card>
      </div>

      <Card title={lang === "tr" ? "Top Holdingler" : "Top Holdings"}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
              <th className="pb-3 pr-4">Symbol</th>
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">{lang === "tr" ? "Ağırlık" : "Weight"}</th>
              <th className="pb-3 pr-4">Value</th>
              <th className="pb-3">{lang === "tr" ? "Değişim" : "Change"}</th>
            </tr>
          </thead>
          <tbody>
            {investor.topHoldings.map((h) => (
              <tr key={h.symbol} className="border-b border-zinc-100 dark:border-zinc-800/50">
                <td className="py-3 pr-4">
                  <Link href={`/stock/${h.symbol}`} className="font-medium text-emerald-600 hover:underline">
                    {h.symbol}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{h.name}</td>
                <td className="py-3 pr-4 tabular-nums font-medium">{h.weight.toFixed(1)}%</td>
                <td className="py-3 pr-4 tabular-nums">{formatCurrency(h.value)}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      h.changeQtr === "increased" || h.changeQtr === "new"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : h.changeQtr === "decreased"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    }`}
                  >
                    {h.changeQtr === "increased" || h.changeQtr === "new" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : h.changeQtr === "decreased" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {h.changeQtr === "new"
                      ? lang === "tr" ? "Yeni" : "New"
                      : `${h.changePercent > 0 ? "+" : ""}${h.changePercent}%`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
