import { NextResponse } from "next/server";
import {
  analyzeWatchlist,
  analyzeStock,
  generateDailyBriefing,
  getAccuracyStats,
} from "@/lib/agents/engine";
import { getAgentWeights, saveAgentWeights } from "@/lib/agents/config";
import type { AgentWeights } from "@/lib/agents/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const briefing = searchParams.get("briefing");

  if (briefing === "true") {
    const data = await generateDailyBriefing();
    return NextResponse.json({ briefing: data });
  }

  if (symbol) {
    const analysis = await analyzeStock(symbol);
    return NextResponse.json({ analysis });
  }

  const [analyses, accuracy, weights] = await Promise.all([
    analyzeWatchlist(),
    getAccuracyStats(),
    getAgentWeights(),
  ]);

  const briefingData = await generateDailyBriefing();

  return NextResponse.json({
    analyses,
    accuracy,
    weights,
    briefing: briefingData,
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.weights) {
    const weights = await saveAgentWeights(body.weights as AgentWeights);
    return NextResponse.json({ weights });
  }

  if (body.symbol) {
    const analysis = await analyzeStock(body.symbol);
    return NextResponse.json({ analysis });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
