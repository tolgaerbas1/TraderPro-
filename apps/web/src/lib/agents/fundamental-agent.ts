import type { ExtendedAgentInsight } from "./types";
import type { AgentContext } from "./types";

export function runFundamentalAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote } = ctx;
  const pe = quote.pe ?? 30;
  const roe = quote.roe ?? 15;
  const signals: string[] = [];

  let direction: ExtendedAgentInsight["direction"] = "neutral";
  let score = 0;

  if (pe < 22) {
    direction = "long";
    score += 0.35;
    signals.push("low_pe");
  } else if (pe > 45) {
    direction = "short";
    score -= 0.3;
    signals.push("high_pe");
  }

  if (roe > 25) {
    score += 0.25;
    signals.push("strong_roe");
    if (direction === "neutral") direction = "long";
  } else if (roe < 10) {
    score -= 0.15;
    signals.push("weak_roe");
  }

  if (quote.dividendYield && quote.dividendYield > 2) {
    signals.push("dividend_yield");
    score += 0.1;
  }

  const confidence = Math.min(0.92, 0.55 + Math.abs(score));

  return {
    agent: "fundamental",
    direction,
    confidence,
    score,
    signals,
    summaryEn:
      direction === "long"
        ? `Fundamentals support ${quote.symbol}: P/E ${pe.toFixed(0)}, ROE ${roe.toFixed(0)}%. Valuation and profitability look favorable.`
        : direction === "short"
          ? `${quote.symbol} trades at stretched multiples (P/E ${pe.toFixed(0)}). Growth must justify premium.`
          : `Mixed fundamentals for ${quote.symbol}. P/E ${pe.toFixed(0)} — wait for clearer signal.`,
    summaryTr:
      direction === "long"
        ? `${quote.symbol} temel verileri destekliyor: F/K ${pe.toFixed(0)}, ROE %${roe.toFixed(0)}. Değerleme ve karlılık olumlu.`
        : direction === "short"
          ? `${quote.symbol} yüksek çarpanlarda (F/K ${pe.toFixed(0)}). Büyüme primi haklı çıkarmalı.`
          : `${quote.symbol} karışık temel görünüm. F/K ${pe.toFixed(0)} — net sinyal bekleyin.`,
  };
}
