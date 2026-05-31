"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import type { RiskReport } from "@/lib/risk";
import type { PortfolioSummary } from "@/types";
import { Shield, AlertTriangle } from "lucide-react";

const RISK_COLORS = ["#059669", "#f59e0b", "#ef4444"];

export default function RiskPage() {
  const { lang } = useLanguage();
  const [risk, setRisk] = useState<RiskReport | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/risk")
      .then((r) => r.json())
      .then((d) => {
        setRisk(d.risk);
        setPortfolio(d.portfolio);
        setLoading(false);
      });
  }, []);

  if (loading || !risk) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </AppShell>
    );
  }

  const sectorData = risk.sectorConcentration.map((s) => ({
    sector: s.sector,
    weight: Math.round(s.weight * 100),
  }));

  const riskColor = risk.riskLabel === "Low" ? "text-emerald-600" : risk.riskLabel === "Medium" ? "text-amber-600" : "text-red-600";
  const riskBg = risk.riskLabel === "Low" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" : risk.riskLabel === "Medium" ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-emerald-600" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Risk Analizi" : "Risk Analysis"}</h1>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${riskBg}`}>
          {lang === "tr"
            ? risk.riskLabel === "Low" ? "Düşük Risk" : risk.riskLabel === "Medium" ? "Orta Risk" : "Yüksek Risk"
            : `${risk.riskLabel} Risk`} ({risk.riskScore})
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">Portfolio Beta</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{risk.beta}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "Volatilite" : "Volatility"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{risk.volatilityScore}%</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">VaR 95%</div>
          <div className={`mt-1 text-lg font-bold tabular-nums text-red-600`}>
            {formatCurrency(risk.var95)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">{lang === "tr" ? "En Büyük Sektör" : "Max Sector"}</div>
          <div className="mt-1 text-lg font-bold tabular-nums">{(risk.maxSectorWeight * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={lang === "tr" ? "Sektör Konsantrasyonu" : "Sector Concentration"}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sectorData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="sector" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="weight" radius={[0, 4, 4, 0]} fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={lang === "tr" ? "Korelasyon Matrisi" : "Correlation Matrix"}>
          <div className="space-y-2">
            {risk.correlationMatrix.slice(0, 10).map((corr, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                <span className="text-sm">
                  {corr.symbol1} ↔ {corr.symbol2}
                </span>
                <span className={`text-sm font-medium tabular-nums ${corr.correlation > 0.7 ? "text-red-600" : corr.correlation > 0.5 ? "text-amber-600" : "text-emerald-600"}`}>
                  {corr.correlation.toFixed(2)}
                </span>
              </div>
            ))}
            {risk.correlationMatrix.length === 0 && (
              <p className="text-sm text-zinc-500">
                {lang === "tr" ? "En az 2 pozisyon gerekli." : "Need at least 2 positions."}
              </p>
            )}
          </div>
        </Card>
      </div>

      {risk.maxSectorWeight > 0.5 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                {lang === "tr" ? "Sektör Konsantrasyonu Uyarısı" : "Sector Concentration Warning"}
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                {lang === "tr"
                  ? `Portföyün %${(risk.maxSectorWeight * 100).toFixed(0)}'i "${risk.sectorConcentration[0]?.sector}" sektöründe. Çeşitlendirmeyi artırmayı değerlendirin.`
                  : `${(risk.maxSectorWeight * 100).toFixed(0)}% of portfolio in "${risk.sectorConcentration[0]?.sector}". Consider diversifying.`}
              </p>
            </div>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
