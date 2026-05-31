import { NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest";
import type { StrategyType } from "@/lib/backtest";

export async function POST(req: Request) {
  const body = await req.json();
  const result = runBacktest(
    body.symbol?.toUpperCase() ?? "AAPL",
    (body.strategy as StrategyType) ?? "ma_crossover",
    body.params ?? {},
    body.months ?? 12
  );
  return NextResponse.json({ result });
}
