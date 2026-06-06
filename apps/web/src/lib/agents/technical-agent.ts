import type { AgentContext, ExtendedAgentInsight } from "./types";

function clampScore(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function runTechnicalAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote, qqqChangePercent, diaChangePercent, marketMomentum } = ctx;
  const signals: string[] = [];
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  const risks: string[] = [];
  const subScores = {
    momentum: 0,
    trend: 0,
    extension: 0,
    macro: 0,
    volatility: 0,
  };

  let score = 0;

  const distFromHigh = ((quote.high52w - quote.price) / quote.high52w) * 100;
  const distFromLow = ((quote.price - quote.low52w) / quote.low52w) * 100;
  const weeklyStrength = quote.changeWeek;
  const monthlyStrength = quote.changeMonth;
  const volatilityProxy = Math.abs(quote.changePercent) + Math.abs(weeklyStrength) / 4;

  if (quote.changePercent > 1.2) {
    subScores.momentum += 0.22;
    score += 0.22;
    signals.push("momentum_up");
    bullCase.push("Today’s momentum is positive.");
  } else if (quote.changePercent < -1.2) {
    subScores.momentum -= 0.22;
    score -= 0.22;
    signals.push("momentum_down");
    bearCase.push("Today’s momentum is weak.");
  }

  if (weeklyStrength > 2) {
    subScores.trend += 0.2;
    score += 0.2;
    signals.push("weekly_uptrend");
    bullCase.push("Weekly trend remains constructive.");
  } else if (weeklyStrength < -2) {
    subScores.trend -= 0.2;
    score -= 0.2;
    signals.push("weekly_downtrend");
    bearCase.push("Weekly trend is under pressure.");
  }

  if (monthlyStrength > 4) {
    subScores.trend += 0.12;
    score += 0.12;
    signals.push("monthly_strength");
  } else if (monthlyStrength < -4) {
    subScores.trend -= 0.12;
    score -= 0.12;
    signals.push("monthly_weakness");
  }

  if (distFromHigh < 5) {
    subScores.extension += 0.08;
    score += 0.08;
    signals.push("near_52w_high");
    bullCase.push("Price is near 52-week highs, showing breakout continuation potential.");
  }
  if (distFromLow < 10) {
    subScores.extension += 0.12;
    score += 0.12;
    signals.push("near_52w_low");
    bullCase.push("Price is near 52-week lows, which can support mean reversion upside.");
  }
  if (distFromHigh > 18) {
    subScores.extension -= 0.12;
    score -= 0.12;
    bearCase.push("Price sits far below highs, indicating weaker trend structure.");
  }

  if (marketMomentum > 0.4 || (qqqChangePercent > 0 && diaChangePercent > 0)) {
    subScores.macro += 0.18;
    score += 0.18;
    signals.push("macro_tailwind");
    bullCase.push("Broader market tape is supportive.");
  } else if (marketMomentum < -0.4 || (qqqChangePercent < 0 && diaChangePercent < 0)) {
    subScores.macro -= 0.18;
    score -= 0.18;
    signals.push("macro_headwind");
    bearCase.push("Broader market tape is weak.");
  }

  if (volatilityProxy > 3.5) {
    subScores.volatility -= 0.12;
    score -= 0.12;
    signals.push("high_volatility");
    risks.push("whipsaw_risk");
  } else {
    subScores.volatility += 0.08;
    score += 0.08;
  }

  const direction: ExtendedAgentInsight["direction"] =
    score > 0.15 ? "long" : score < -0.15 ? "short" : "neutral";
  const confidence = Math.min(0.92, 0.5 + Math.abs(score) + 0.12);

  return {
    agent: "technical",
    direction,
    confidence,
    score: clampScore(score),
    signals,
    breakdown: {
      subScores,
      bullCase: bullCase.length > 0 ? bullCase : ["Technical setup is balanced but not decisive."],
      bearCase: bearCase.length > 0 ? bearCase : ["No major technical warning, but confirmation is limited."],
      risks,
    },
    summaryEn:
      direction === "long"
        ? `Technical setup bullish: ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}% today, ${weeklyStrength >= 0 ? "+" : ""}${weeklyStrength.toFixed(1)}% weekly.`
        : direction === "short"
          ? `Bearish price action on ${quote.symbol}. Momentum and trend are fading.`
          : `${quote.symbol} is consolidating. Await a clearer breakout or breakdown.`,
    summaryTr:
      direction === "long"
        ? `Teknik görünüm boğa: bugünün değişimi ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%, haftalık ${weeklyStrength >= 0 ? "+" : ""}${weeklyStrength.toFixed(1)}%.`
        : direction === "short"
          ? `${quote.symbol} ayı baskısı altında. Momentum ve trend zayıflıyor.`
          : `${quote.symbol} konsolidasyonda. Daha net kırılım/kırılma bekleniyor.`,
  };
}
