import type { ExtendedAgentInsight, AgentContext } from "./types";

export function runRegimeAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote, marketRegime, spyChangePercent } = ctx;
  const signals: string[] = [];
  let direction: ExtendedAgentInsight["direction"] = "neutral";
  let score = 0;

  if (marketRegime === "risk_on") {
    score += 0.25;
    signals.push("risk_on");
    direction = "long";
  } else if (marketRegime === "risk_off") {
    score -= 0.25;
    signals.push("risk_off");
    direction = "short";
  }

  if (quote.sector === "Technology" && spyChangePercent > 0) {
    score += 0.15;
    signals.push("sector_tailwind");
  }

  if (quote.changeMonth > 5) {
    signals.push("monthly_strength");
    score += 0.1;
  }

  const confidence = Math.min(0.85, 0.5 + Math.abs(score) + 0.1);

  const regimeLabel = { risk_on: "risk-on", risk_off: "risk-off", neutral: "neutral" }[marketRegime];

  return {
    agent: "regime",
    direction,
    confidence,
    score,
    signals,
    summaryEn: `Market regime is ${regimeLabel} (SPY ${spyChangePercent >= 0 ? "+" : ""}${spyChangePercent.toFixed(2)}%). ${quote.sector} sector alignment ${score >= 0 ? "positive" : "mixed"}.`,
    summaryTr: `Piyasa rejimi ${regimeLabel === "risk-on" ? "risk-on" : regimeLabel === "risk-off" ? "risk-off" : "nötr"} (SPY ${spyChangePercent >= 0 ? "+" : ""}${spyChangePercent.toFixed(2)}%). ${quote.sector} sektör uyumu ${score >= 0 ? "olumlu" : "karışık"}.`,
  };
}
