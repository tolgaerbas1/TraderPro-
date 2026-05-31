import type { Order, PortfolioSummary, ClosedTrade } from "@/types";

export interface BrokerAdapter {
  getPortfolio(): Promise<PortfolioSummary>;
  placeOrder(order: Omit<Order, "id" | "status" | "createdAt" | "fillPrice">): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getClosedTrades(): Promise<ClosedTrade[]>;
  cancelOrder(id: string): Promise<boolean>;
}
