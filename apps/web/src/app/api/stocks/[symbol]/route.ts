import { NextResponse } from "next/server";
import { getStockQuote, getStockAnalysis } from "@/lib/market-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  const [quote, analysis] = await Promise.all([
    getStockQuote(upper),
    getStockAnalysis(upper),
  ]);
  return NextResponse.json({ quote, analysis });
}
