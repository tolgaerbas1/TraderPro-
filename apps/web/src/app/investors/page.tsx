"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import type { Investor, InvestorHolding } from "@/lib/investors/data";
import { Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function InvestorsPage() {
  const { t, lang } = useLanguage();
  const [investors, setInvestors] = useState<Array<Investor & { holdingCount: number; topSymbol: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/investors")
      .then((r) => r.json())
      .then((d) => {
        setInvestors(d.investors ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <Users className="h-7 w-7 text-emerald-600" />
        <h1 className="text-2xl font-bold">{lang === "tr" ? "Ünlü Yatırımcı Portföyleri" : "Famous Investor Portfolios"}</h1>
      </div>

      <p className="mb-6 text-sm text-zinc-500">
        {lang === "tr"
          ? "Son 13F bildirimlerine göre en büyük 5 holding. Veriler çeyreklik güncellenir."
          : "Top 5 holdings based on latest 13F filings. Data updated quarterly."}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investors.map((inv) => (
            <Card key={inv.id}>
              <div className="mb-3">
                <Link
                  href={`/investors/${inv.id}`}
                  className="text-lg font-bold text-emerald-600 hover:underline"
                >
                  {inv.name}
                </Link>
                <div className="text-sm text-zinc-500">{inv.firm}</div>
              </div>

              <Badge variant="info">{inv.style}</Badge>

              <div className="mt-3 text-xs text-zinc-500">
                {lang === "tr" ? "Portföy Değeri:" : "Portfolio Value:"}{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(inv.totalPortfolioValue)}
                </span>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                {lang === "tr"
                  ? `Son hamle: ${(inv as Investor).recentMovesTr.slice(0, 80)}...`
                  : `Recent: ${(inv as Investor).recentMovesEn.slice(0, 80)}...`}
              </div>

              <Link
                href={`/investors/${inv.id}`}
                className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
              >
                {lang === "tr" ? "Portföyü incele" : "View portfolio"}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
