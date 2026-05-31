import { NextResponse } from "next/server";
import { getBroker } from "@/lib/broker/instance";
import { computeRiskReport } from "@/lib/risk";

export async function GET() {
  const b = await getBroker();
  const portfolio = await b.getPortfolio();
  const risk = computeRiskReport(portfolio.positions);
  return NextResponse.json({ risk, portfolio });
}
