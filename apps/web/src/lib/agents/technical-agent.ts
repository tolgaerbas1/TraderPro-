import type { ExtendedAgentInsight, AgentContext } from "./types";

export function runTechnicalAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote } = ctx;
  const signals: string[] = [];
  let direction: ExtendedAgentInsight["direction"] = "neutral";
  let score = 0;

  const distFromHigh = ((quote.high52w - quote.price) / quote.high52w) * 100;
  const distFromLow = ((quote.price - quote.low52w) / quote.low52w) * 100;

  if (quote.changePercent > 1) {
    direction = "long";
    score += 0.3;
    signals.push("momentum_up");
  } else if (quote.changePercent < -1) {
    direction = "short";
    score -= 0.3;
    signals.push("momentum_down");
  }

  if (quote.changeWeek > 2) {
    score += 0.2;
    signals.push("weekly_uptrend");
    if (direction === "neutral") direction = "long";
  } else if (quote.changeWeek < -2) {
    score -= 0.2;
    signals.push("weekly_downtrend");
    if (direction === "neutral") direction = "short";
  }

  if (distFromHigh < 5) {
    signals.push("near_52w_high");
    score += 0.1;
  }
  if (distFromLow < 10) {
    signals.push("near_52w_low");
    score += 0.15;
    if (direction === "neutral") direction = "long";
  }

  const confidence = Math.min(0.9, 0.5 + Math.abs(score) + 0.15);

  return {
    agent: "technical",
    direction,
    confidence,
    score,
    signals,
    summaryEn:
      direction === "long"
        ? `Technical setup bullish: ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}% today, ${quote.changeWeek >= 0 ? "+" : ""}${quote.changeWeek.toFixed(1)}% weekly.`
        : direction === "short"
          ? `Bearish price action on ${quote.symbol}. Momentum fading, watch support levels.`
          : `${quote.symbol} consolidating. RSI zone neutral, await breakout.`,
    summaryTr:
      direction === "long"
        ? `Teknik görünüm boğa: bugün ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%, haftalık ${quote.changeWeek >= 0 ? "+" : ""}${quote.changeWeek.toFixed(1)}%.`
        : direction === "short"
          ? `${quote.symbol} ayı baskısı altında. Momentum zayıflıyor, destek seviyeleri izlenmeli.`
          : `${quote.symbol} konsolidasyon. Net kırılım bekleniyor.`,
  };
}
