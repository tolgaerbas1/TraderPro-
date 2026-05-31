import type { ClosedTrade, Order, PortfolioPosition, PortfolioSummary } from "@/types";
import type { BrokerAdapter } from "./types";

const INITIAL_POSITIONS: PortfolioPosition[] = [
  { symbol: "AAPL", quantity: 10, avgCost: 175.0, currentPrice: 0 },
  { symbol: "NVDA", quantity: 5, avgCost: 120.0, currentPrice: 0 },
  { symbol: "MSFT", quantity: 8, avgCost: 400.0, currentPrice: 0 },
];

/** Seed closed trades for demo P/L history */
const INITIAL_CLOSED: ClosedTrade[] = [
  {
    id: "cls_1",
    symbol: "META",
    quantity: 3,
    avgCost: 480,
    sellPrice: 585,
    realizedPnL: 315,
    closedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "cls_2",
    symbol: "TSLA",
    quantity: 2,
    avgCost: 260,
    sellPrice: 248,
    realizedPnL: -24,
    closedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

let positions = [...INITIAL_POSITIONS];
let orders: Order[] = [];
let closedTrades: ClosedTrade[] = [...INITIAL_CLOSED];

function buildSummary(prices: Record<string, number>): PortfolioSummary {
  const enriched = positions.map((p) => ({
    ...p,
    currentPrice: prices[p.symbol] ?? p.avgCost,
  }));

  const totalValue = enriched.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const totalCost = enriched.reduce((s, p) => s + p.quantity * p.avgCost, 0);
  const unrealizedPnL = totalValue - totalCost;
  const realizedPnL = closedTrades.reduce((s, t) => s + t.realizedPnL, 0);

  const dayChange = enriched.reduce(
    (s, p) => s + p.quantity * p.currentPrice * 0.003,
    0
  );

  return {
    totalValue,
    totalCost,
    unrealizedPnL,
    unrealizedPnLPercent: totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0,
    realizedPnL,
    totalPnL: unrealizedPnL + realizedPnL,
    dayChange,
    dayChangePercent: totalValue > 0 ? (dayChange / totalValue) * 100 : 0,
    weekChange: unrealizedPnL * 0.15,
    weekChangePercent: totalCost > 0 ? ((unrealizedPnL * 0.15) / totalCost) * 100 : 0,
    positions: enriched,
  };
}

export class MockBroker implements BrokerAdapter {
  constructor(private priceLookup: () => Promise<Record<string, number>>) {}

  async getPortfolio(): Promise<PortfolioSummary> {
    const prices = await this.priceLookup();
    return buildSummary(prices);
  }

  async placeOrder(
    order: Omit<Order, "id" | "status" | "createdAt" | "fillPrice">
  ): Promise<Order> {
    const prices = await this.priceLookup();
    const fillPrice = order.limitPrice ?? prices[order.symbol] ?? 100;

    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      status: "filled",
      fillPrice,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);

    if (order.side === "buy") {
      const existing = positions.find((p) => p.symbol === order.symbol);
      if (existing) {
        const totalQty = existing.quantity + order.quantity;
        existing.avgCost =
          (existing.avgCost * existing.quantity + fillPrice * order.quantity) / totalQty;
        existing.quantity = totalQty;
      } else {
        positions.push({
          symbol: order.symbol,
          quantity: order.quantity,
          avgCost: fillPrice,
          currentPrice: fillPrice,
        });
      }
    } else {
      const existing = positions.find((p) => p.symbol === order.symbol);
      if (existing) {
        const sellQty = Math.min(order.quantity, existing.quantity);
        const realizedPnL = (fillPrice - existing.avgCost) * sellQty;
        closedTrades.unshift({
          id: `cls_${Date.now()}`,
          symbol: order.symbol,
          quantity: sellQty,
          avgCost: existing.avgCost,
          sellPrice: fillPrice,
          realizedPnL,
          closedAt: new Date().toISOString(),
        });
        existing.quantity = Math.max(0, existing.quantity - sellQty);
        if (existing.quantity === 0) {
          positions = positions.filter((p) => p.symbol !== order.symbol);
        }
      }
    }

    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return orders;
  }

  async getClosedTrades(): Promise<ClosedTrade[]> {
    return closedTrades;
  }

  async cancelOrder(id: string): Promise<boolean> {
    const order = orders.find((o) => o.id === id && o.status === "pending");
    if (order) {
      order.status = "cancelled";
      return true;
    }
    return false;
  }
}

export function resetMockBroker() {
  positions = [...INITIAL_POSITIONS];
  orders = [];
  closedTrades = [...INITIAL_CLOSED];
}
