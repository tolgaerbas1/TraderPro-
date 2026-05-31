import type { ClosedTrade, Order } from "@/types";

export function exportTradesCsv(orders: Order[], closedTrades: ClosedTrade[]): string {
  const header = "Type,ID,Symbol,Side,Quantity,Price,Date,PnL";
  const orderRows = orders.map(
    (o) =>
      `Order,${o.id},${o.symbol},${o.side},${o.quantity},${o.fillPrice ?? ""},${o.createdAt},`
  );
  const tradeRows = closedTrades.map(
    (t) =>
      `Closed,${t.id},${t.symbol},sell,${t.quantity},${t.sellPrice},${t.closedAt},${t.realizedPnL.toFixed(2)}`
  );
  return [header, ...orderRows, ...tradeRows].join("\n");
}
