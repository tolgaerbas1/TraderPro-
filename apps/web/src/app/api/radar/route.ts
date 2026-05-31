import { NextRequest, NextResponse } from "next/server";
import { runRadarScan } from "@/lib/market-data";
import type { ConsensusAction } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const filters = {
    peMax: body.peMax != null ? Number(body.peMax) : undefined,
    peMin: body.peMin != null ? Number(body.peMin) : undefined,
    roeMin: body.roeMin != null ? Number(body.roeMin) : undefined,
    changeDayMin: body.changeDayMin != null ? Number(body.changeDayMin) : undefined,
    changeWeekMin: body.changeWeekMin != null ? Number(body.changeWeekMin) : undefined,
    sector: body.sector || undefined,
    consensus: (body.consensus as ConsensusAction) || undefined,
  };

  const results = await runRadarScan(filters);
  return NextResponse.json({ count: results.length, results });
}

export async function GET() {
  const results = await runRadarScan({});
  return NextResponse.json({ count: results.length, results });
}
