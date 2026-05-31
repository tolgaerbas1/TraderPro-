"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, ChangeCell, ConsensusBadge } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { SECTORS } from "@/lib/stocks";
import type { StockQuote, StockAnalysis, ConsensusAction } from "@/types";

export default function RadarPage() {
  const { t, lang } = useLanguage();
  const [filters, setFilters] = useState({
    peMax: "",
    roeMin: "",
    changeDayMin: "",
    changeWeekMin: "",
    sector: "",
    consensus: "" as ConsensusAction | "",
  });
  const [results, setResults] = useState<{ quote: StockQuote; analysis: StockAnalysis }[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  async function runScan() {
    setLoading(true);
    const body: Record<string, string | number> = {};
    if (filters.peMax) body.peMax = Number(filters.peMax);
    if (filters.roeMin) body.roeMin = Number(filters.roeMin);
    if (filters.changeDayMin) body.changeDayMin = Number(filters.changeDayMin);
    if (filters.changeWeekMin) body.changeWeekMin = Number(filters.changeWeekMin);
    if (filters.sector) body.sector = filters.sector;
    if (filters.consensus) body.consensus = filters.consensus;

    const res = await fetch("/api/radar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setResults(data.results ?? []);
    setScanned(true);
    setLoading(false);
  }

  function clearFilters() {
    setFilters({ peMax: "", roeMin: "", changeDayMin: "", changeWeekMin: "", sector: "", consensus: "" });
    setResults([]);
    setScanned(false);
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">{t.radar.title}</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card title={t.radar.filters} className="lg:col-span-1">
          <div className="space-y-4">
            <Field label={t.radar.peMax}>
              <input
                type="number"
                value={filters.peMax}
                onChange={(e) => setFilters({ ...filters, peMax: e.target.value })}
                className="input-field"
                placeholder="40"
              />
            </Field>
            <Field label={t.radar.roeMin}>
              <input
                type="number"
                value={filters.roeMin}
                onChange={(e) => setFilters({ ...filters, roeMin: e.target.value })}
                className="input-field"
                placeholder="15"
              />
            </Field>
            <Field label={t.radar.changeDayMin}>
              <input
                type="number"
                value={filters.changeDayMin}
                onChange={(e) => setFilters({ ...filters, changeDayMin: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </Field>
            <Field label={t.radar.changeWeekMin}>
              <input
                type="number"
                value={filters.changeWeekMin}
                onChange={(e) => setFilters({ ...filters, changeWeekMin: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </Field>
            <Field label={t.radar.sector}>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="input-field"
              >
                <option value="">{t.radar.all}</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label={t.radar.consensus}>
              <select
                value={filters.consensus}
                onChange={(e) => setFilters({ ...filters, consensus: e.target.value as ConsensusAction | "" })}
                className="input-field"
              >
                <option value="">{t.radar.all}</option>
                <option value="buy">{t.consensus.buy}</option>
                <option value="hold">{t.consensus.hold}</option>
                <option value="sell">{t.consensus.sell}</option>
              </select>
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                onClick={runScan}
                disabled={loading}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "..." : t.radar.scan}
              </button>
              <button
                onClick={clearFilters}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              >
                {t.radar.clear}
              </button>
            </div>
          </div>
        </Card>

        <Card
          title={`${t.radar.results}${scanned ? ` (${results.length} ${t.radar.matches})` : ""}`}
          className="lg:col-span-3"
        >
          {!scanned ? (
            <p className="text-zinc-500">Filtreleri ayarlayıp &quot;{t.radar.scan}&quot; butonuna tıklayın.</p>
          ) : results.length === 0 ? (
            <p className="text-zinc-500">No matches found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
                    <th className="pb-3 pr-4">Symbol</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Day %</th>
                    <th className="pb-3 pr-4">P/E</th>
                    <th className="pb-3 pr-4">ROE</th>
                    <th className="pb-3 pr-4">Sector</th>
                    <th className="pb-3">Consensus</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ quote, analysis }) => (
                    <tr key={quote.symbol} className="border-b border-zinc-100 dark:border-zinc-800/50">
                      <td className="py-3 pr-4">
                        <Link href={`/stock/${quote.symbol}`} className="font-medium text-emerald-600 hover:underline">
                          {quote.symbol}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{formatCurrency(quote.price)}</td>
                      <td className="py-3 pr-4"><ChangeCell value={quote.changePercent} /></td>
                      <td className="py-3 pr-4">{quote.pe?.toFixed(1) ?? "—"}</td>
                      <td className="py-3 pr-4">{quote.roe?.toFixed(1) ?? "—"}%</td>
                      <td className="py-3 pr-4">{quote.sector}</td>
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
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
