import { NextResponse } from "next/server";
import { INVESTORS } from "@/lib/investors/data";

export async function GET() {
  return NextResponse.json({
    investors: INVESTORS.map(({ topHoldings, ...rest }) => ({
      ...rest,
      holdingCount: topHoldings.length,
      topSymbol: topHoldings[0]?.symbol ?? null,
    })),
  });
}
