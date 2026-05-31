import type { StockMeta } from "@/types";

/** Top 10 US companies by market cap — NASDAQ + NYSE mix */
export const DEFAULT_WATCHLIST: StockMeta[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Cyclical" },
  { symbol: "TSM", name: "Taiwan Semiconductor", exchange: "NYSE", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Consumer Cyclical" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MU", name: "Micron Technology Inc.", exchange: "NASDAQ", sector: "Technology" },
];

export const MARKET_INDICES = ["SPY", "QQQ", "DIA", "VIX"];

export const SECTORS = [
  "Technology",
  "Consumer Cyclical",
  "Healthcare",
  "Financial",
  "Energy",
];
