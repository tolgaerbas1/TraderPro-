import { NextRequest, NextResponse } from "next/server";
import { runRadarScan, getStockQuotes } from "@/lib/market-data";
import { getStockAnalysis } from "@/lib/market-data";
import { DEFAULT_WATCHLIST, NYSE_WATCHLIST, TOP_100_WATCHLIST } from "@/lib/stocks";
import type { ConsensusAction } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const list = searchParams.get("list");
  const symbols = searchParams.get("symbols");

  let targetSymbols: string[];

  if (symbols) {
    targetSymbols = symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  } else if (list === "top100") {
    targetSymbols = TOP_100_WATCHLIST.map((s) => s.symbol);
  } else if (list === "nyse") {
    targetSymbols = NYSE_WATCHLIST.map((s) => s.symbol);
  } else {
    targetSymbols = DEFAULT_WATCHLIST.map((s) => s.symbol);
  }

  const quotes = await getStockQuotes(targetSymbols);
  const results = await Promise.all(
    quotes.map(async (quote) => {
      const analysis = await getStockAnalysis(quote.symbol);
      return { quote, analysis };
    })
  );

  const sourceCounts = results.reduce(
    (acc, row) => {
      const source = row.quote.dataSource ?? "mock";
      acc[source] += 1;
      return acc;
    },
    { live: 0, cached: 0, mock: 0 }
  );

  return NextResponse.json({ count: results.length, results, sourceCounts });
}
