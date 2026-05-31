import { NextRequest, NextResponse } from "next/server";
import { getAlerts, addAlert, deleteAlert, toggleAlert, checkAlerts } from "@/lib/alerts/store";
import { getPriceMap } from "@/lib/market-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("check") === "true") {
    const prices = await getPriceMap();
    const triggered = checkAlerts(prices);
    const all = getAlerts();
    return NextResponse.json({ alerts: all, triggered });
  }
  return NextResponse.json({ alerts: getAlerts() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const alert = addAlert(body);
  return NextResponse.json({ alert });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    deleteAlert(id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Missing id" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (body.id && body.action === "toggle") {
    const alert = toggleAlert(body.id);
    return NextResponse.json({ alert });
  }
  if (body.id && body.action === "reset") {
    const { resetAlert } = await import("@/lib/alerts/store");
    const alert = resetAlert(body.id);
    return NextResponse.json({ alert });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
