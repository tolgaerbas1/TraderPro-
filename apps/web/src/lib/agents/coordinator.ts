import type { AgentWeights, CoordinatorResult, ExtendedAgentInsight } from "./types";
import { directionScore } from "./types";
import type { ConsensusAction } from "@/types";
import { getSuggestedPositionPct } from "./risk-agent";
import type { AgentContext } from "./types";

export function runCoordinator(
  agents: ExtendedAgentInsight[],
  weights: AgentWeights,
  ctx: AgentContext
): CoordinatorResult {
  const riskAgent = agents.find((a) => a.agent === "risk");
  const conflicts: string[] = [];

  const longAgents = agents.filter((a) => a.direction === "long" && a.agent !== "risk");
  const shortAgents = agents.filter((a) => a.direction === "short" && a.agent !== "risk");

  if (longAgents.length > 0 && shortAgents.length > 0) {
    conflicts.push(
      `${longAgents.map((a) => a.agent).join(", ")} bullish vs ${shortAgents.map((a) => a.agent).join(", ")} bearish`
    );
  }

  let score = 0;
  let totalWeight = 0;

  for (const a of agents) {
    if (a.agent === "risk") continue;
    const w = weights[a.agent];
    score += directionScore(a.direction) * a.confidence * w;
    totalWeight += w;
  }

  const normalized = totalWeight > 0 ? score / totalWeight : 0;
  const confidence = Math.min(0.95, Math.abs(normalized) + 0.45);

  let consensus: ConsensusAction = "hold";
  if (normalized > 0.12) consensus = "buy";
  else if (normalized < -0.12) consensus = "sell";

  let approved = true;
  let vetoReason: string | undefined;

  if (riskAgent?.veto) {
    approved = false;
    vetoReason = riskAgent.summaryEn;
    if (consensus === "buy") consensus = "hold";
  }

  const suggestedPositionPct = approved ? getSuggestedPositionPct(ctx) : 0;

  const actionEn = { buy: "BUY", sell: "SELL", hold: "HOLD" }[consensus];
  const actionTr = { buy: "AL", sell: "SAT", hold: "BEKLE" }[consensus];

  const conflictNote =
    conflicts.length > 0
      ? ` Note: agent disagreement detected.`
      : "";

  return {
    consensus,
    confidence,
    score: normalized,
    approved,
    vetoReason,
    suggestedPositionPct,
    conflicts,
    summaryEn: approved
      ? `Coordinator: ${actionEn} (${(confidence * 100).toFixed(0)}% confidence). Suggested size: ${suggestedPositionPct}% of portfolio.${conflictNote}`
      : `Coordinator: HOLD — risk veto active.${conflictNote}`,
    summaryTr: approved
      ? `Koordinatör: ${actionTr} (güven %${(confidence * 100).toFixed(0)}). Önerilen boyut: portföyün %${suggestedPositionPct}'i.${conflictNote ? " Agent görüş ayrılığı var." : ""}`
      : `Koordinatör: BEKLE — risk vetosu aktif.${conflictNote ? " Agent görüş ayrılığı var." : ""}`,
  };
}
