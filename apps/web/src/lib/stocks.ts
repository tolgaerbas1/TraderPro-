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

export const NYSE_WATCHLIST: StockMeta[] = [
  { symbol: "BRK.B", name: "Berkshire Hathaway", exchange: "NYSE", sector: "Financial" },
  { symbol: "JPM", name: "JPMorgan Chase", exchange: "NYSE", sector: "Financial" },
  { symbol: "LLY", name: "Eli Lilly and Co", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil", exchange: "NYSE", sector: "Energy" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", sector: "Consumer Cyclical" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", sector: "Financial" },
  { symbol: "UNH", name: "UnitedHealth Group", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE", sector: "Financial" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "HD", name: "Home Depot", exchange: "NYSE", sector: "Consumer Cyclical" },
];

export const MARKET_INDICES = ["SPY", "QQQ", "DIA", "VIX"];

export const SECTORS = [
  "Technology",
  "Consumer Cyclical",
  "Healthcare",
  "Financial",
  "Energy",
];
