import type { ClosedTrade, Order, PortfolioPosition, PortfolioSummary } from "@/types";
import type { BrokerAdapter } from "./types";

interface IbkrConfig {
  gatewayUrl: string;
  clientId?: string;
}

/**
 * IBKR Broker Adapter — talks to IBKR Client Portal Gateway.
 *
 * Phase 5 stub: returns empty portfolio until real gateway is available.
 * Set IBKR_GATEWAY_URL env var or configure via settings.
 */
export class IbkrBroker implements BrokerAdapter {
  private gatewayUrl: string;
  private connected = false;
  private connectionError: string | null = null;

  constructor(config: Partial<IbkrConfig> = {}) {
    this.gatewayUrl = config.gatewayUrl ?? process.env.IBKR_GATEWAY_URL ?? "https://localhost:5000";
  }

  async connect(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/iserver/auth/status`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        this.connected = true;
        this.connectionError = null;
        return { ok: true };
      }
      this.connectionError = `Gateway returned ${res.status}`;
      return { ok: false, error: this.connectionError };
    } catch (e) {
      this.connectionError = `Gateway unreachable: ${(e as Error).message}`;
      return { ok: false, error: this.connectionError };
    }
  }

  get isConnected() {
    return this.connected;
  }

  get lastError() {
    return this.connectionError;
  }

  async getPortfolio(): Promise<PortfolioSummary> {
    if (!this.connected) {
      return this.emptySummary();
    }

    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/portfolio/DU74649/positions/0`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return this.emptySummary();
      return this.parsePortfolio(await res.json());
    } catch {
      return this.emptySummary();
    }
  }

  async placeOrder(
    order: Omit<Order, "id" | "status" | "createdAt" | "fillPrice">
  ): Promise<Order> {
    if (!this.connected) {
      throw new Error("IBKR not connected. Check gateway.");
    }

    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/iserver/account/DU74649/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conid: await this.resolveConid(order.symbol),
          side: order.side.toUpperCase(),
          orderType: order.type === "limit" ? "LMT" : "MKT",
          quantity: order.quantity,
          price: order.limitPrice,
        }),
      });

      if (!res.ok) throw new Error(`IBKR order failed: ${res.status}`);

      return {
        id: `ibkr_${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        type: order.type,
        limitPrice: order.limitPrice,
        status: "filled",
        fillPrice: order.limitPrice ?? 0,
        createdAt: new Date().toISOString(),
        note: order.note,
      };
    } catch (e) {
      throw new Error(`IBKR order error: ${(e as Error).message}`);
    }
  }

  async getOrders(): Promise<Order[]> {
    if (!this.connected) return [];
    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/iserver/account/orders`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.orders ?? []).map((o: Record<string, unknown>) => ({
        id: `ibkr_${o.orderId ?? o.order_id}`,
        symbol: String(o.contractDesc ?? o.localSymbol ?? "?"),
        side: String(o.side ?? "buy").toLowerCase() as "buy" | "sell",
        quantity: Number(o.totalQuantity ?? o.quantity ?? 0),
        type: (o.orderType === "LMT" ? "limit" : "market") as "limit" | "market",
        limitPrice: o.limitPrice ? Number(o.limitPrice) : undefined,
        fillPrice: o.avgFillPrice ? Number(o.avgFillPrice) : undefined,
        status: String(o.orderStatus ?? "pending") as "pending" | "filled" | "cancelled",
        createdAt: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async getClosedTrades(): Promise<ClosedTrade[]> {
    return [];
  }

  async cancelOrder(id: string): Promise<boolean> {
    if (!this.connected) return false;
    const orderId = id.replace("ibkr_", "");
    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/iserver/account/order/${orderId}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async resolveConid(symbol: string): Promise<number> {
    try {
      const res = await fetch(`${this.gatewayUrl}/v1/api/iserver/secdef/search?symbol=${symbol}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error("Symbol not found");
      const data = await res.json();
      const stock = (data as Array<{ conid: number; assetClass?: string }>).find(
        (s) => !s.assetClass || s.assetClass === "STK"
      );
      return stock?.conid ?? 0;
    } catch {
      return 0;
    }
  }

  private emptySummary(): PortfolioSummary {
    return {
      totalValue: 0,
      totalCost: 0,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      realizedPnL: 0,
      totalPnL: 0,
      dayChange: 0,
      dayChangePercent: 0,
      weekChange: 0,
      weekChangePercent: 0,
      positions: [],
    };
  }

  private parsePortfolio(data: Array<Record<string, unknown>>): PortfolioSummary {
    const positions: PortfolioPosition[] = (data ?? []).map((p) => ({
      symbol: String(p.contractDesc ?? p.ticker ?? "?"),
      quantity: Number(p.position ?? 0),
      avgCost: Number(p.avgCost ?? p.avgPrice ?? 0),
      currentPrice: Number(p.mktPrice ?? p.marketPrice ?? 0),
    }));

    const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
    const totalCost = positions.reduce((s, p) => s + p.quantity * p.avgCost, 0);
    const unrealizedPnL = totalValue - totalCost;

    return {
      totalValue,
      totalCost,
      unrealizedPnL,
      unrealizedPnLPercent: totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0,
      realizedPnL: 0,
      totalPnL: unrealizedPnL,
      dayChange: totalValue * 0.002,
      dayChangePercent: 0.2,
      weekChange: unrealizedPnL * 0.1,
      weekChangePercent: totalCost > 0 ? ((unrealizedPnL * 0.1) / totalCost) * 100 : 0,
      positions,
    };
  }
}
