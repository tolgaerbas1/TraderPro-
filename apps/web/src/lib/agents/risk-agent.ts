import type { AgentContext, ExtendedAgentInsight } from "./types";

function clampScore(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function runRiskAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote } = ctx;
  const signals: string[] = [];
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  const risks: string[] = [];
  const subScores = {
    volatility: 0,
    valuation: 0,
    concentration: 0,
    leverage: 0,
  };

  const volatilityProxy = Math.abs(quote.changePercent) + Math.abs(quote.changeWeek) / 4 + Math.abs(quote.changeMonth) / 10;
  const nearHigh = quote.price / quote.high52w > 0.95;
  const nearLow = quote.price / quote.low52w < 1.08;
  const leverage = quote.debtToEquity ?? 0;
  const pe = quote.pe ?? 0;
  const beta = quote.beta ?? 1;

  let veto = false;
  let recommendedPositionPct = 5;
  let score = 0;

  if (volatilityProxy > 4) {
    subScores.volatility -= 0.28;
    score -= 0.28;
    signals.push("high_volatility");
    risks.push("whipsaw_risk");
    recommendedPositionPct = 2;
  } else if (volatilityProxy < 2) {
    subScores.volatility += 0.08;
    score += 0.08;
    bullCase.push("Volatility profile is manageable.");
  }

  if (nearHigh) {
    subScores.concentration -= 0.18;
    score -= 0.18;
    signals.push("extended_price");
    risks.push("extended_near_high");
    recommendedPositionPct = Math.min(recommendedPositionPct, 3);
  } else if (nearLow) {
    subScores.concentration += 0.08;
    score += 0.08;
    bullCase.push("Price is still close to support.");
  }

  if (pe > 50) {
    subScores.valuation -= 0.16;
    score -= 0.16;
    signals.push("valuation_risk");
    risks.push("rich_valuation");
    recommendedPositionPct = Math.min(recommendedPositionPct, 2);
  }

  if (beta > 1.4) {
    subScores.volatility -= 0.12;
    score -= 0.12;
    signals.push("high_beta");
    risks.push("market_sensitivity");
    recommendedPositionPct = Math.min(recommendedPositionPct, 2);
  }

  if (leverage > 1.8) {
    subScores.leverage -= 0.14;
    score -= 0.14;
    risks.push("balance_sheet_leverage");
    recommendedPositionPct = Math.min(recommendedPositionPct, 2);
  } else if (leverage > 0 && leverage < 0.7) {
    subScores.leverage += 0.06;
    score += 0.06;
  }

  if (volatilityProxy > 5 && nearHigh) {
    veto = true;
    signals.push("veto_extended_volatile");
    bearCase.push("Volatility is elevated while the stock is extended.");
  }

  const confidence = Math.min(0.92, 0.62 + Math.abs(score));

  return {
    agent: "risk",
    direction: "neutral",
    confidence,
    score: clampScore(veto ? -0.6 : score),
    signals,
    veto,
    recommendedPositionPct: veto ? 0 : recommendedPositionPct,
    breakdown: {
      subScores,
      bullCase: bullCase.length > 0 ? bullCase : ["Risk is acceptable for a starter position."],
      bearCase: bearCase.length > 0 ? bearCase : ["No severe risk flags, but position sizing should still be disciplined."],
      risks,
    },
    summaryEn: veto
      ? `Risk veto: ${quote.symbol} is extended, volatile, and too risky for fresh size.`
      : `Risk approved. Suggested size ${recommendedPositionPct}% of portfolio.`
      + (recommendedPositionPct <= 2 ? " Keep sizing small until volatility cools." : ""),
    summaryTr: veto
      ? `Risk vetosu: ${quote.symbol} genişlemiş, volatil ve yeni pozisyon için riskli.`
      : `Risk onaylandı. Önerilen boyut portföyün %${recommendedPositionPct}'i.`
      + (recommendedPositionPct <= 2 ? " Volatilite sakinleşene kadar küçük boyut tercih edilmeli." : ""),
  };
}

export function getSuggestedPositionPct(ctx: AgentContext): number {
  const insight = runRiskAgent(ctx);
  return insight.veto ? 0 : insight.recommendedPositionPct ?? 5;
}
