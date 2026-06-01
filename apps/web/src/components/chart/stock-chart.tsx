"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from "lightweight-charts";
import type { IChartApi, CandlestickData, LineData } from "lightweight-charts";
import { Skeleton } from "@/components/ui/skeleton";

interface StockChartProps {
  symbol: string;
}

type Timeframe = "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y";

export function StockChart({ symbol }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/${symbol}/history?range=${timeframe}`)
      .then((r) => r.json())
      .then((d) => {
        const candles: CandlestickData[] = (d.data ?? []).map((p: { date: string; open: number; high: number; low: number; close: number; volume: number }) => ({
          time: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
        }));
        setData(candles);
        setLoading(false);
      });
  }, [symbol, timeframe]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const isDark = document.documentElement.classList.contains("dark");

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#71717a",
      },
      grid: {
        vertLines: { color: isDark ? "#27272a" : "#e4e4e7" },
        horzLines: { color: isDark ? "#27272a" : "#e4e4e7" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: {
        borderColor: isDark ? "#27272a" : "#e4e4e7",
      },
      timeScale: {
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        timeVisible: timeframe === "5D",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#059669",
      downColor: "#ef4444",
      borderUpColor: "#059669",
      borderDownColor: "#ef4444",
      wickUpColor: "#059669",
      wickDownColor: "#ef4444",
    });
    candleSeries.setData(data);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.setData(
      data.map((c, _i) => ({
        time: c.time,
        value: (c as unknown as { volume?: number }).volume ?? 10000000,
        color: c.close >= c.open ? "rgba(5, 150, 105, 0.3)" : "rgba(239, 68, 68, 0.3)",
      }))
    );
    chart.priceScale("").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    if (data.length >= 20) {
      const sma20 = calcSMA(data, 20);
      const smaL20 = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1 });
      smaL20.setData(sma20);
    }

    if (data.length >= 50) {
      const sma50 = calcSMA(data, 50);
      const smaL50 = chart.addSeries(LineSeries, { color: "#8b5cf6", lineWidth: 1 });
      smaL50.setData(sma50);
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, timeframe]);

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
          <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> SMA 20</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-purple-500" /> SMA 50</span>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-zinc-900/50">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}

function calcSMA(data: CandlestickData[], period: number): LineData[] {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0);
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}
