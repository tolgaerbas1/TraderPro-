"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import type { EarningsEvent } from "@/lib/earnings/data";
import { CalendarDays } from "lucide-react";

export default function EarningsPage() {
  const { lang } = useLanguage();
  const [events, setEvents] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/earnings")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.upcoming ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <CalendarDays className="h-7 w-7 text-emerald-600" />
        <h1 className="text-2xl font-bold">{lang === "tr" ? "Kazanç Takvimi" : "Earnings Calendar"}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">{lang === "tr" ? "Şirket" : "Company"}</th>
                <th className="pb-3 pr-4">{lang === "tr" ? "Tarih" : "Date"}</th>
                <th className="pb-3 pr-4">{lang === "tr" ? "Zaman" : "Time"}</th>
                <th className="pb-3 pr-4">EPS Est.</th>
                <th className="pb-3">{lang === "tr" ? "Gelir Tahmini" : "Revenue Est."}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={`${e.symbol}-${e.date}`} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 pr-4">
                    <Link href={`/stock/${e.symbol}`} className="font-medium text-emerald-600 hover:underline">
                      {e.symbol}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{e.name}</td>
                  <td className="py-3 pr-4 tabular-nums">
                    {new Date(e.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={e.time === "pre" ? "info" : "warning"}>
                      {e.time === "pre" ? (lang === "tr" ? "Açılış Öncesi" : "Pre-market") : (lang === "tr" ? "Kapanış Sonrası" : "After-close")}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{e.epsEstimate ? `$${e.epsEstimate.toFixed(2)}` : "—"}</td>
                  <td className="py-3 tabular-nums">{e.revenueEstimate ? `$${(e.revenueEstimate / 1e9).toFixed(2)}B` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppShell>
  );
}
