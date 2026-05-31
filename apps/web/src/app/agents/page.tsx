"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge, ConsensusBadge } from "@/components/ui/card";
import { AgentPanel } from "@/components/agents/agent-panel";
import { useLanguage } from "@/hooks/useLanguage";
import type { FullStockAnalysis, AgentAccuracyStat, DailyBriefing } from "@/lib/agents/types";
import type { AgentWeights } from "@/lib/agents/types";
import { DEFAULT_WEIGHTS } from "@/lib/agents/types";
import { Bot, RefreshCw, ShieldAlert } from "lucide-react";

export default function AgentsPage() {
  const { t, lang, bilingual } = useLanguage();
  const [analyses, setAnalyses] = useState<FullStockAnalysis[]>([]);
  const [accuracy, setAccuracy] = useState<AgentAccuracyStat[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [weights, setWeights] = useState<AgentWeights>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAnalyses(data.analyses ?? []);
    setAccuracy(data.accuracy ?? []);
    setBriefing(data.briefing ?? null);
    setWeights(data.weights ?? DEFAULT_WEIGHTS);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveWeights() {
    setSaving(true);
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights }),
    });
    await load();
    setSaving(false);
  }

  const selectedAnalysis = analyses.find((a) => a.symbol === selected);

  if (loading) {
    return (
      <AppShell>
        <p className="text-zinc-500">Loading...</p>
      </AppShell>
    );
  }

  const accuracyChart = accuracy.map((a) => ({
    name: t.agents[a.agent],
    accuracy: Math.round(a.accuracy),
  }));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-emerald-600" />
          <h1 className="text-2xl font-bold">{t.agentsPage.title}</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          <RefreshCw className="h-4 w-4" />
          {t.agentsPage.refresh}
        </button>
      </div>

      {briefing && (
        <Card title={t.agentsPage.dailyBriefing} className="mb-6">
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            {bilingual ? `${briefing.marketSummaryTr} / ${briefing.marketSummaryEn}` : lang === "tr" ? briefing.marketSummaryTr : briefing.marketSummaryEn}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BriefingList
              label={t.consensus.buy}
              items={briefing.topBuys.map((b) => `${b.symbol} (${(b.confidence * 100).toFixed(0)}%)`)}
              variant="success"
            />
            <BriefingList
              label={t.consensus.sell}
              items={briefing.topSells.map((s) => `${s.symbol} (${(s.confidence * 100).toFixed(0)}%)`)}
              variant="danger"
            />
            <BriefingList
              label={t.consensus.hold}
              items={briefing.holds.slice(0, 5)}
              variant="warning"
            />
          </div>
          <ul className="mt-4 space-y-1 text-xs text-zinc-500">
            {(lang === "tr" ? briefing.highlightsTr : briefing.highlightsEn).map((h, i) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t.agentsPage.accuracy} className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accuracyChart} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {accuracyChart.map((_, i) => (
                  <Cell key={i} fill={["#059669", "#0ea5e9", "#8b5cf6", "#f59e0b"][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t.agentsPage.weights} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(Object.keys(DEFAULT_WEIGHTS) as (keyof AgentWeights)[]).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-zinc-500">{t.agents[key]}</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={Math.round(weights[key] * 100)}
                  onChange={(e) =>
                    setWeights({ ...weights, [key]: Number(e.target.value) / 100 })
                  }
                  className="w-full"
                />
                <div className="text-center text-sm tabular-nums">{(weights[key] * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
          <button
            onClick={saveWeights}
            disabled={saving}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "..." : t.agentsPage.saveWeights}
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t.agentsPage.watchlistAnalysis} className="lg:col-span-1">
          <div className="max-h-[480px] space-y-2 overflow-y-auto">
            {analyses.map((a) => (
              <button
                key={a.symbol}
                onClick={() => setSelected(a.symbol)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected === a.symbol
                    ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div>
                  <span className="font-medium">{a.symbol}</span>
                  {!a.coordinator.approved && (
                    <ShieldAlert className="ml-1 inline h-3 w-3 text-amber-500" />
                  )}
                </div>
                <ConsensusBadge action={a.consensus} lang={lang} />
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <AgentPanel analysis={selectedAnalysis} />
          ) : (
            <Card>
              <p className="text-zinc-500">{t.agentsPage.selectSymbol}</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BriefingList({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "success" | "danger" | "warning";
}) {
  return (
    <div>
      <Badge variant={variant}>{label}</Badge>
      <ul className="mt-2 space-y-1 text-sm">
        {items.length === 0 ? (
          <li className="text-zinc-400">—</li>
        ) : (
          items.map((item) => (
            <li key={item}>
              <Link href={`/stock/${item.split(" ")[0]}`} className="text-emerald-600 hover:underline">
                {item}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
