import type { AgentContext, ExtendedAgentInsight } from "./types";

function clampScore(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function runFundamentalAgent(ctx: AgentContext): ExtendedAgentInsight {
  const { quote } = ctx;
  const pe = quote.pe ?? 30;
  const forwardPe = quote.forwardPe ?? pe;
  const pb = quote.pb ?? 4;
  const roe = quote.roe ?? 15;
  const earningsGrowth = quote.earningsGrowth ?? 0;
  const revenueGrowth = quote.revenueGrowth ?? 0;
  const profitMargins = quote.profitMargins ?? 0;
  const debtToEquity = quote.debtToEquity ?? 0;
  const dividendYield = quote.dividendYield ?? 0;
  const marketCap = quote.marketCap ?? 0;

  const signals: string[] = [];
  const bullCase: string[] = [];
  const bearCase: string[] = [];
  const risks: string[] = [];
  const subScores = {
    valuation: 0,
    quality: 0,
    growth: 0,
    income: 0,
    balance: 0,
    scale: 0,
  };

  let score = 0;

  if (forwardPe < pe) {
    subScores.valuation += 0.12;
    score += 0.12;
    signals.push("forward_pe_discount");
    bullCase.push("Forward P/E is below trailing P/E.");
  }

  if (pe < 22) {
    subScores.valuation += 0.28;
    score += 0.28;
    signals.push("low_pe");
    bullCase.push("P/E is still within a reasonable range.");
  } else if (pe > 45) {
    subScores.valuation -= 0.32;
    score -= 0.32;
    signals.push("high_pe");
    bearCase.push("Trailing P/E is rich and needs strong growth support.");
  }

  if (pb < 5) {
    subScores.valuation += 0.08;
    score += 0.08;
  } else if (pb > 15) {
    subScores.valuation -= 0.1;
    score -= 0.1;
    risks.push("price_to_book_rich");
  }

  if (roe > 25) {
    subScores.quality += 0.26;
    score += 0.26;
    signals.push("strong_roe");
    bullCase.push(`ROE is strong at ${roe.toFixed(0)}%.`);
  } else if (roe < 10) {
    subScores.quality -= 0.18;
    score -= 0.18;
    signals.push("weak_roe");
    bearCase.push("ROE is weak versus higher quality peers.");
  }

  if (profitMargins > 0.2) {
    subScores.quality += 0.1;
    score += 0.1;
    bullCase.push(`Margins are healthy at ${(profitMargins * 100).toFixed(0)}%.`);
  } else if (profitMargins < 0.1) {
    subScores.quality -= 0.06;
    score -= 0.06;
    bearCase.push("Margins are thin.");
  }

  if (earningsGrowth > 0.15 || revenueGrowth > 0.1) {
    subScores.growth += 0.22;
    score += 0.22;
    signals.push("growth_supported");
    bullCase.push("Earnings/revenue growth is above the threshold.");
  } else if (earningsGrowth < 0.05 && revenueGrowth < 0.05) {
    subScores.growth -= 0.12;
    score -= 0.12;
    bearCase.push("Growth is muted.");
  }

  if (dividendYield > 0.02) {
    subScores.income += 0.08;
    score += 0.08;
    signals.push("dividend_yield");
    bullCase.push("Dividend yield adds income support.");
  }

  if (debtToEquity < 0.7) {
    subScores.balance += 0.08;
    score += 0.08;
  } else if (debtToEquity > 1.8) {
    subScores.balance -= 0.14;
    score -= 0.14;
    risks.push("leverage_risk");
    bearCase.push("Balance sheet leverage is elevated.");
  }

  if (marketCap > 100_000_000_000) {
    subScores.scale += 0.08;
    score += 0.08;
    bullCase.push("Scale provides operating resilience.");
  }

  const direction: ExtendedAgentInsight["direction"] =
    score > 0.15 ? "long" : score < -0.15 ? "short" : "neutral";
  const confidence = Math.min(0.95, 0.52 + Math.abs(score));

  return {
    agent: "fundamental",
    direction,
    confidence,
    score: clampScore(score),
    signals,
    breakdown: {
      subScores,
      bullCase: bullCase.length > 0 ? bullCase : ["Fundamental profile is constructive."],
      bearCase: bearCase.length > 0 ? bearCase : ["No major fundamental red flags, but the setup is not compelling enough yet."],
      risks,
    },
    summaryEn:
      direction === "long"
        ? `Fundamentals support ${quote.symbol}: trailing P/E ${pe.toFixed(0)}, forward P/E ${forwardPe.toFixed(0)}, ROE ${roe.toFixed(0)}%.`
        : direction === "short"
          ? `${quote.symbol} looks expensive relative to its earnings and balance sheet profile.`
          : `Mixed fundamentals for ${quote.symbol}. Need clearer valuation or growth confirmation.`,
    summaryTr:
      direction === "long"
        ? `${quote.symbol} temel verileri destekliyor: F/K ${pe.toFixed(0)}, ileri F/K ${forwardPe.toFixed(0)}, ROE %${roe.toFixed(0)}.`
        : direction === "short"
          ? `${quote.symbol} kazanç ve bilanço profiline göre pahalı görünüyor.`
          : `${quote.symbol} karışık temel görünüm. Daha net değerleme veya büyüme teyidi beklenmeli.`,
  };
}
