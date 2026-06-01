export interface EarningsEvent {
  symbol: string;
  name: string;
  date: string;
  time: "pre" | "post";
  epsEstimate: number | null;
  revenueEstimate: number | null;
}

const ALL_EARNINGS: EarningsEvent[] = [
  { symbol: "ORCL", name: "Oracle", date: "2026-06-09", time: "post", epsEstimate: 1.66, revenueEstimate: 15.9e9 },
  { symbol: "ADBE", name: "Adobe", date: "2026-06-11", time: "post", epsEstimate: 4.98, revenueEstimate: 5.75e9 },
  { symbol: "FDX", name: "FedEx", date: "2026-06-17", time: "post", epsEstimate: 5.48, revenueEstimate: 22.4e9 },
  { symbol: "ACN", name: "Accenture", date: "2026-06-18", time: "pre", epsEstimate: 3.38, revenueEstimate: 16.8e9 },
  { symbol: "MU", name: "Micron", date: "2026-06-23", time: "post", epsEstimate: 0.72, revenueEstimate: 7.2e9 },
  { symbol: "NKE", name: "Nike", date: "2026-06-25", time: "post", epsEstimate: 0.86, revenueEstimate: 12.1e9 },
  { symbol: "TSLA", name: "Tesla", date: "2026-07-20", time: "post", epsEstimate: 0.68, revenueEstimate: 27.1e9 },
  { symbol: "GOOGL", name: "Alphabet", date: "2026-07-22", time: "post", epsEstimate: 2.22, revenueEstimate: 84.5e9 },
  { symbol: "MSFT", name: "Microsoft", date: "2026-07-22", time: "post", epsEstimate: 3.15, revenueEstimate: 68.2e9 },
  { symbol: "META", name: "Meta", date: "2026-07-23", time: "post", epsEstimate: 5.92, revenueEstimate: 42.1e9 },
  { symbol: "AAPL", name: "Apple", date: "2026-07-29", time: "post", epsEstimate: 1.55, revenueEstimate: 92.3e9 },
  { symbol: "AMZN", name: "Amazon", date: "2026-07-29", time: "post", epsEstimate: 1.42, revenueEstimate: 155.2e9 },
  { symbol: "NVDA", name: "NVIDIA", date: "2026-08-19", time: "post", epsEstimate: 0.89, revenueEstimate: 45.2e9 },
  { symbol: "AVGO", name: "Broadcom", date: "2026-09-03", time: "post", epsEstimate: 1.42, revenueEstimate: 16.1e9 },
];

const WATCHLIST_SYMBOLS = new Set(["NVDA", "GOOGL", "AAPL", "MSFT", "AMZN", "TSM", "AVGO", "TSLA", "META", "MU"]);

export function getUpcomingEarnings(limit = 20): EarningsEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  return ALL_EARNINGS
    .filter((e) => e.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getWatchlistEarnings(): EarningsEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  return ALL_EARNINGS
    .filter((e) => WATCHLIST_SYMBOLS.has(e.symbol) && e.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getThisWeekEarnings(): EarningsEvent[] {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const endStr = weekEnd.toISOString().slice(0, 10);
  const nowStr = now.toISOString().slice(0, 10);
  return ALL_EARNINGS
    .filter((e) => e.date >= nowStr && e.date <= endStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
