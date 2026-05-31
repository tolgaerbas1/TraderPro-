import type { PortfolioPosition } from "@/types";

export interface RiskReport {
  beta: number;
  sectorConcentration: { sector: string; weight: number }[];
  maxSectorWeight: number;
  volatilityScore: number;
  var95: number;
  correlationMatrix: { symbol1: string; symbol2: string; correlation: number }[];
  riskScore: number;
  riskLabel: string;
}

export function computeRiskReport(positions: PortfolioPosition[]): RiskReport {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);

  const sectorMap: Record<string, number> = {};
  for (const p of positions) {
    const sector = p.sector ?? "Other";
    sectorMap[sector] = (sectorMap[sector] ?? 0) + p.quantity * p.currentPrice;
  }

  const sectorConcentration = Object.entries(sectorMap)
    .map(([sector, value]) => ({ sector, weight: totalValue > 0 ? value / totalValue : 0 }))
    .sort((a, b) => b.weight - a.weight);

  const maxSectorWeight = sectorConcentration[0]?.weight ?? 0;

  const beta = positions.reduce((s, p) => {
    const stockBeta = p.sector === "Technology" ? 1.3 : p.sector === "Financial" ? 1.1 : 1.0;
    const weight = totalValue > 0 ? (p.quantity * p.currentPrice) / totalValue : 0;
    return s + stockBeta * weight;
  }, 0);

  const volatilityScore = positions.reduce((s, p) => {
    const weight = totalValue > 0 ? (p.quantity * p.currentPrice) / totalValue : 0;
    return s + weight * (0.02 + Math.random() * 0.03);
  }, 0);

  const var95 = totalValue * volatilityScore * 1.645;

  const correlationMatrix: RiskReport["correlationMatrix"] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const sameSector = positions[i].sector === positions[j].sector;
      correlationMatrix.push({
        symbol1: positions[i].symbol,
        symbol2: positions[j].symbol,
        correlation: sameSector ? 0.6 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3,
      });
    }
  }

  let riskScore = 0;
  if (maxSectorWeight > 0.5) riskScore += 30;
  if (maxSectorWeight > 0.7) riskScore += 20;
  if (volatilityScore > 0.03) riskScore += 25;
  if (positions.length < 3) riskScore += 20;
  riskScore += positions.length > 1 ? 15 : 0;

  const riskLabel = riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High";

  return {
    beta: Math.round(beta * 100) / 100,
    sectorConcentration,
    maxSectorWeight: Math.round(maxSectorWeight * 100) / 100,
    volatilityScore: Math.round(volatilityScore * 10000) / 100,
    var95: Math.round(var95 * 100) / 100,
    correlationMatrix: correlationMatrix.map((c) => ({
      ...c,
      correlation: Math.round(c.correlation * 100) / 100,
    })),
    riskScore,
    riskLabel,
  };
}
