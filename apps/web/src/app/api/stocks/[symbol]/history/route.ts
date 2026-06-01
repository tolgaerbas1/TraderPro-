import { NextResponse } from "next/server";

interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const MOCK_PRICES: Record<string, number> = {
  NVDA: 135.5, GOOGL: 176.2, AAPL: 228.4, MSFT: 415, AMZN: 198.3,
  TSM: 185, AVGO: 168.5, TSLA: 248, META: 585, MU: 98.5,
};

function generateMockHistory(symbol: string, days: number): HistoryPoint[] {
  const base = MOCK_PRICES[symbol] ?? 100;
  const points: HistoryPoint[] = [];
  let price = base * (0.7 + Math.random() * 0.3);

  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const change = (Math.random() - 0.47) * 0.025;
    price = Math.max(price * (1 + change), 1);

    const open = price;
    const close = price * (1 + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    points.push({
      date: d.toISOString().slice(0, 10),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round((5 + Math.random() * 30) * 1e6),
    });
    price = close;
  }
  return points;
}

async function fetchYahooHistory(symbol: string, days: number): Promise<HistoryPoint[] | null> {
  try {
    const yahooFinance = await import("yahoo-finance2");
    const mod = yahooFinance.default ?? yahooFinance;

    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - days - 5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await mod.historical(symbol, {
      period1: past.toISOString().slice(0, 10),
      period2: now.toISOString().slice(0, 10),
      interval: "1d",
    })) as Array<Record<string, unknown>>;

    if (!result?.length) return null;

    return result.slice(-days).map((r) => ({
      date: String(r.date).slice(0, 10),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume ?? 0),
    }));
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const url = new URL(_req.url);
  const range = url.searchParams.get("range") ?? "1M";

  const daysMap: Record<string, number> = {
    "5D": 5, "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "5Y": 1260,
  };
  const days = daysMap[range] ?? 21;

  const live = await fetchYahooHistory(symbol.toUpperCase(), days);
  const data = live ?? generateMockHistory(symbol.toUpperCase(), days);

  return NextResponse.json({ symbol: symbol.toUpperCase(), range, data });
}
