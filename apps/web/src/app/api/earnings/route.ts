import { NextResponse } from "next/server";
import { getUpcomingEarnings, getWatchlistEarnings, getThisWeekEarnings } from "@/lib/earnings/data";

export async function GET() {
  return NextResponse.json({
    upcoming: getUpcomingEarnings(),
    watchlist: getWatchlistEarnings(),
    thisWeek: getThisWeekEarnings(),
  });
}
