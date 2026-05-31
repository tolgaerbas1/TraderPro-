import { NextResponse } from "next/server";
import { getBroker } from "@/lib/broker/instance";

export async function GET() {
  const b = await getBroker();
  const portfolio = await b.getPortfolio();
  const orders = await b.getOrders();
  const closedTrades = await b.getClosedTrades();
  return NextResponse.json({ portfolio, orders, closedTrades });
}

export async function POST(req: Request) {
  const b = await getBroker();
  const body = await req.json();
  const order = await b.placeOrder({
    symbol: body.symbol.toUpperCase(),
    side: body.side,
    quantity: Number(body.quantity),
    type: body.type ?? "market",
    limitPrice: body.limitPrice ? Number(body.limitPrice) : undefined,
    note: body.note,
  });
  const portfolio = await b.getPortfolio();
  const closedTrades = await b.getClosedTrades();
  return NextResponse.json({ order, portfolio, closedTrades });
}
