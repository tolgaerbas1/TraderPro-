import { NextResponse } from "next/server";
import { getStockQuote } from "@/lib/market-data";
import { analyzeStock } from "@/lib/agents/engine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  const [quote, analysis] = await Promise.all([
    getStockQuote(upper),
    analyzeStock(upper),
  ]);
  return NextResponse.json({ quote, analysis });
}
