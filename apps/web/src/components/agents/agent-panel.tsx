"use client";

import Link from "next/link";
import { Badge, ConsensusBadge } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import type { FullStockAnalysis } from "@/lib/agents/types";
import type { StockAnalysis } from "@/types";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type AnalysisInput = FullStockAnalysis | StockAnalysis;

function isFullAnalysis(a: AnalysisInput): a is FullStockAnalysis {
  return "coordinator" in a && a.coordinator != null && "approved" in a.coordinator;
}

export function AgentPanel({ analysis }: { analysis: AnalysisInput }) {
  const { t, lang, bilingual } = useLanguage();
  const full = isFullAnalysis(analysis);
  const coordinator = full ? analysis.coordinator : analysis.coordinator;

  return (
    <Card
      title={`${analysis.symbol}${analysis.name ? ` — ${analysis.name}` : ""}`}
      action={
        <Link href={`/stock/${analysis.symbol}`} className="text-xs text-emerald-600 hover:underline">
          {t.agentsPage.viewDetail}
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ConsensusBadge action={analysis.consensus} lang={lang} />
        <span className="text-sm text-zinc-500">
          {(analysis.consensusConfidence * 100).toFixed(0)}% {t.agentsPage.confidence}
        </span>
        {coordinator && (
          <>
            {coordinator.approved ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t.agentsPage.riskApproved}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <XCircle className="h-3.5 w-3.5" />
                {t.agentsPage.riskVeto}
              </span>
            )}
            {coordinator.suggestedPositionPct != null && coordinator.approved && (
              <Badge variant="info">
                {t.agentsPage.suggestedSize}: {coordinator.suggestedPositionPct}%
              </Badge>
            )}
          </>
        )}
      </div>

      <p className="mb-4 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50">
        {bilingual
          ? `${analysis.summaryTr} / ${analysis.summaryEn}`
          : lang === "tr"
            ? analysis.summaryTr
            : analysis.summaryEn}
      </p>

      {coordinator?.conflicts && coordinator.conflicts.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">{t.agentsPage.conflicts}</div>
            {coordinator.conflicts.map((c, i) => (
              <div key={i}>{c}</div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {analysis.agents.map((agent) => (
          <AgentCard key={agent.agent} agent={agent} lang={lang} bilingual={bilingual} t={t} />
        ))}
      </div>

      {analysis.analyzedAt && (
        <p className="mt-4 text-xs text-zinc-400">
          {t.agentsPage.analyzedAt}: {new Date(analysis.analyzedAt).toLocaleString()}
        </p>
      )}
    </Card>
  );
}

function AgentCard({
  agent,
  lang,
  bilingual,
  t,
}: {
  agent: AnalysisInput["agents"][0];
  lang: "tr" | "en";
  bilingual: boolean;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const summary = bilingual
    ? `${agent.summaryTr} / ${agent.summaryEn}`
    : lang === "tr"
      ? agent.summaryTr
      : agent.summaryEn;

  const dirIcon = { long: "↑ Long", short: "↓ Short", neutral: "→ Neutral" }[agent.direction];

  return (
    <div className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{t.agents[agent.agent]}</span>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              agent.direction === "long" ? "success" : agent.direction === "short" ? "danger" : "default"
            }
          >
            {dirIcon}
          </Badge>
          <span className="text-xs tabular-nums text-zinc-500">
            {(agent.confidence * 100).toFixed(0)}%
          </span>
          {agent.veto && <Badge variant="warning">VETO</Badge>}
        </div>
      </div>
      <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">{summary}</p>
      {agent.signals && agent.signals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.signals.map((s) => (
            <span
              key={s}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
