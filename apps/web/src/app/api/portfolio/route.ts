import { NextResponse } from "next/server";
import { broker } from "@/lib/broker/instance";

export async function GET() {
  const portfolio = await broker.getPortfolio();
  const orders = await broker.getOrders();
  const closedTrades = await broker.getClosedTrades();
  return NextResponse.json({ portfolio, orders, closedTrades });
}

export async function POST(req: Request) {
  const body = await req.json();
  const order = await broker.placeOrder({
    symbol: body.symbol.toUpperCase(),
    side: body.side,
    quantity: Number(body.quantity),
    type: body.type ?? "market",
    limitPrice: body.limitPrice ? Number(body.limitPrice) : undefined,
    note: body.note,
  });
  const portfolio = await broker.getPortfolio();
  const closedTrades = await broker.getClosedTrades();
  return NextResponse.json({ order, portfolio, closedTrades });
}
