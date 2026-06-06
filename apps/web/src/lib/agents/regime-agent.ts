import type { AgentContext, ExtendedAgentInsight } from "./types";

function clampScore(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function runRegimeAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote, marketRegime, spyChangePercent, qqqChangePercent, diaChangePercent, marketMomentum } = ctx;
  const signals: string[] = [];
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  const risks: string[] = [];
  const subScores = {
    market: 0,
    sector: 0,
    breadth: 0,
    momentum: 0,
  };

  let score = 0;

  if (marketRegime === "risk_on") {
    subScores.market += 0.24;
    score += 0.24;
    signals.push("risk_on");
    bullCase.push("The market regime is risk-on.");
  } else if (marketRegime === "risk_off") {
    subScores.market -= 0.24;
    score -= 0.24;
    signals.push("risk_off");
    bearCase.push("The market regime is risk-off.");
  }

  if (quote.sector === "Technology" && qqqChangePercent > 0) {
    subScores.sector += 0.15;
    score += 0.15;
    signals.push("tech_sector_tailwind");
    bullCase.push("Technology is benefiting from QQQ strength.");
  } else if (quote.sector === "Energy" && diaChangePercent < 0) {
    subScores.sector -= 0.08;
    score -= 0.08;
    signals.push("energy_headwind");
  }

  if (spyChangePercent > 0.5 || qqqChangePercent > 0.5 || diaChangePercent > 0.5) {
    subScores.breadth += 0.1;
    score += 0.1;
    signals.push("broad_market_strength");
    bullCase.push("Broader index tape is strong.");
  } else if (spyChangePercent < -0.5 && qqqChangePercent < -0.5 && diaChangePercent < -0.5) {
    subScores.breadth -= 0.14;
    score -= 0.14;
    signals.push("broad_market_weakness");
    bearCase.push("Broad market weakness is confirmed across indices.");
  }

  if (marketMomentum > 0.35) {
    subScores.momentum += 0.12;
    score += 0.12;
    signals.push("positive_market_momentum");
  } else if (marketMomentum < -0.35) {
    subScores.momentum -= 0.12;
    score -= 0.12;
    signals.push("negative_market_momentum");
    risks.push("macro_headwind");
  }

  if (quote.changeMonth > 5) {
    subScores.momentum += 0.08;
    score += 0.08;
    signals.push("monthly_strength");
    bullCase.push("The stock is participating in a constructive monthly trend.");
  }

  const direction: ExtendedAgentInsight["direction"] =
    score > 0.1 ? "long" : score < -0.1 ? "short" : "neutral";
  const confidence = Math.min(0.9, 0.5 + Math.abs(score) + 0.08);

  const regimeLabel = { risk_on: "risk-on", risk_off: "risk-off", neutral: "neutral" }[marketRegime];
  const regimeContext = `SPY ${spyChangePercent >= 0 ? "+" : ""}${spyChangePercent.toFixed(2)}%, QQQ ${qqqChangePercent >= 0 ? "+" : ""}${qqqChangePercent.toFixed(2)}%, DIA ${diaChangePercent >= 0 ? "+" : ""}${diaChangePercent.toFixed(2)}%.`;

  return {
    agent: "regime",
    direction,
    confidence,
    score: clampScore(score),
    signals,
    breakdown: {
      subScores,
      bullCase: bullCase.length > 0 ? bullCase : ["Regime is not a major headwind."],
      bearCase: bearCase.length > 0 ? bearCase : ["No clear macro tailwind yet."],
      risks,
    },
    summaryEn: `Market regime is ${regimeLabel}. ${regimeContext} ${quote.sector} alignment ${score >= 0 ? "positive" : "mixed"}.`,
    summaryTr: `Piyasa rejimi ${regimeLabel === "risk-on" ? "risk-on" : regimeLabel === "risk-off" ? "risk-off" : "nötr"}. ${regimeContext} ${quote.sector} uyumu ${score >= 0 ? "olumlu" : "karışık"}.`,
  };
}
