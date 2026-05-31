import { NextRequest, NextResponse } from "next/server";
import { getNewsFeed } from "@/lib/news/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const sentiment = searchParams.get("sentiment");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  let items = getNewsFeed();

  if (symbol) {
    items = items.filter((n) => n.symbol === symbol);
  }
  if (sentiment) {
    items = items.filter((n) => n.sentiment === sentiment);
  }

  return NextResponse.json({ items: items.slice(0, limit), total: getNewsFeed().length });
}
