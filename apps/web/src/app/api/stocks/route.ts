import { NextResponse } from "next/server";
import { getWatchlistQuotes, getMarketIndices } from "@/lib/market-data";

export async function GET() {
  const [quotes, indices] = await Promise.all([
    getWatchlistQuotes(),
    getMarketIndices(),
  ]);
  return NextResponse.json({ quotes, indices });
}
