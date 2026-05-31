import type { ExtendedAgentInsight, AgentContext } from "./types";

export function runRiskAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote } = ctx;
  const signals: string[] = [];
  let veto = false;

  const volatilityProxy = Math.abs(quote.changePercent) + Math.abs(quote.changeWeek) / 5;
  const nearHigh = quote.price / quote.high52w > 0.95;

  let suggestedPct = 5;
  if (volatilityProxy > 3) {
    suggestedPct = 2;
    signals.push("high_volatility");
  }
  if (nearHigh) {
    signals.push("extended_price");
    suggestedPct = Math.min(suggestedPct, 3);
  }
  if (quote.pe && quote.pe > 50) {
    signals.push("valuation_risk");
    suggestedPct = Math.min(suggestedPct, 2);
  }

  // Veto if extreme volatility + extended
  if (volatilityProxy > 4 && nearHigh) {
    veto = true;
    signals.push("veto_extended_volatile");
  }

  const direction: ExtendedAgentInsight["direction"] = veto ? "neutral" : "neutral";

  return {
    agent: "risk",
    direction,
    confidence: 0.75,
    score: veto ? -0.5 : 0.1,
    signals,
    veto,
    summaryEn: veto
      ? `Risk veto: ${quote.symbol} too volatile near highs. Reduce size or wait.`
      : `Risk approved. Max position ${suggestedPct}% of portfolio. Stop-loss at -8% recommended.`,
    summaryTr: veto
      ? `Risk vetosu: ${quote.symbol} zirveye yakın ve volatil. Pozisyon küçültün veya bekleyin.`
      : `Risk onaylandı. Max pozisyon portföyün %${suggestedPct}'i. Stop-loss -%8 önerilir.`,
  };
}

export function getSuggestedPositionPct(ctx: AgentContext): number {
  const insight = runRiskAgent(ctx);
  if (insight.veto) return 0;
  const vol = Math.abs(ctx.quote.changePercent) + Math.abs(ctx.quote.changeWeek) / 5;
  if (vol > 3) return 2;
  if (ctx.quote.pe && ctx.quote.pe > 50) return 2;
  return 5;
}
