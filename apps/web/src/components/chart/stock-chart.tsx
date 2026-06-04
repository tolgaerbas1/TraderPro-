"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StockChartProps {
  symbol: string;
}

type Timeframe = "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y";

type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function StockChart({ symbol }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [data, setData] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${symbol}/history?range=${timeframe}`)
      .then((r) => r.json())
      .then((d) => {
        setData((d.data ?? []).map((p: CandlePoint) => p));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol, timeframe]);

  const chart = useMemo(() => {
    if (data.length === 0) return null;

    const width = 920;
    const height = 400;
    const priceTop = 24;
    const priceBottom = 280;
    const volumeTop = 300;
    const volumeBottom = 380;
    const minPrice = Math.min(...data.map((d) => d.low));
    const maxPrice = Math.max(...data.map((d) => d.high));
    const priceRange = Math.max(maxPrice - minPrice, 1);
    const volumeMax = Math.max(...data.map((d) => d.volume), 1);
    const step = width / Math.max(data.length, 1);

    const priceY = (value: number) => priceTop + ((maxPrice - value) / priceRange) * (priceBottom - priceTop);
    const volumeY = (value: number) => volumeBottom - (value / volumeMax) * (volumeBottom - volumeTop);
    const linePath = data
      .map((point, index) => `${index === 0 ? "M" : "L"} ${index * step + step / 2} ${priceY(point.close)}`)
      .join(" ");

    return { width, height, step, priceY, volumeY, linePath };
  }, [data]);

  const timeframes: Timeframe[] = ["5D", "1M", "3M", "6M", "1Y", "5Y"];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                timeframe === tf
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-[10px] text-zinc-400">
          <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> Close</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Candle range</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        <div className="w-full px-2 py-3">
          {!chart ? (
            <div className="h-[400px] w-full" />
          ) : (
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[400px] w-full">
              {data.map((point, index) => {
                const x = index * chart.step + chart.step / 2;
                const candleTop = chart.priceY(point.high);
                const candleBottom = chart.priceY(point.low);
                const openY = chart.priceY(point.open);
                const closeY = chart.priceY(point.close);
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
                const isUp = point.close >= point.open;
                return (
                  <g key={point.time}>
                    <line x1={x} y1={candleTop} x2={x} y2={candleBottom} stroke={isUp ? "#059669" : "#ef4444"} strokeWidth="1.5" />
                    <rect
                      x={x - Math.max(chart.step * 0.22, 2)}
                      y={bodyTop}
                      width={Math.max(chart.step * 0.44, 3)}
                      height={bodyHeight}
                      fill={isUp ? "#059669" : "#ef4444"}
                      opacity="0.9"
                    />
                    <rect
                      x={x - Math.max(chart.step * 0.18, 1)}
                      y={chart.volumeY(point.volume)}
                      width={Math.max(chart.step * 0.36, 2)}
                      height={380 - chart.volumeY(point.volume)}
                      fill={isUp ? "rgba(5, 150, 105, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                    />
                  </g>
                );
              })}
              <path d={chart.linePath} fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
