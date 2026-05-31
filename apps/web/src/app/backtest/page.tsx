"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_WATCHLIST } from "@/lib/stocks";
import type { BacktestResult, StrategyType } from "@/lib/backtest";
import { TrendingUp, Activity } from "lucide-react";

export default function BacktestPage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [symbol, setSymbol] = useState("AAPL");
  const [strategy, setStrategy] = useState<StrategyType>("ma_crossover");
  const [months, setMonths] = useState(12);
  const [fastPeriod, setFastPeriod] = useState(20);
  const [slowPeriod, setSlowPeriod] = useState(50);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const params = strategy === "ma_crossover"
      ? { fast: fastPeriod, slow: slowPeriod }
      : { period: rsiPeriod, oversold: rsiOversold, overbought: rsiOverbought };

    const res = await fetch("/api/backtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, strategy, params, months }),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
    toast(`${symbol} backtest complete`);
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-7 w-7 text-emerald-600" />
        <h1 className="text-2xl font-bold">{lang === "tr" ? "Backtest" : "Backtest"}</h1>
      </div>

      <div className="mb-6">
        <Card title={lang === "tr" ? "Strateji Ayarları" : "Strategy Settings"}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Symbol</label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="input-field w-28">
                {DEFAULT_WATCHLIST.map((s) => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">{lang === "tr" ? "Strateji" : "Strategy"}</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value as StrategyType)} className="input-field w-40">
                <option value="ma_crossover">MA Crossover</option>
                <option value="rsi">RSI</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">{lang === "tr" ? "Periyot (Ay)" : "Period (Months)"}</label>
              <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="input-field w-24">
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>

            {strategy === "ma_crossover" && (
              <>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Fast MA</label>
                  <input type="number" value={fastPeriod} onChange={(e) => setFastPeriod(Number(e.target.value))} className="input-field w-20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Slow MA</label>
                  <input type="number" value={slowPeriod} onChange={(e) => setSlowPeriod(Number(e.target.value))} className="input-field w-20" />
                </div>
              </>
            )}

            {strategy === "rsi" && (
              <>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">RSI Period</label>
                  <input type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(Number(e.target.value))} className="input-field w-20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">{lang === "tr" ? "Aşırı Satım" : "Oversold"}</label>
                  <input type="number" value={rsiOversold} onChange={(e) => setRsiOversold(Number(e.target.value))} className="input-field w-20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">{lang === "tr" ? "Aşırı Alım" : "Overbought"}</label>
                  <input type="number" value={rsiOverbought} onChange={(e) => setRsiOverbought(Number(e.target.value))} className="input-field w-20" />
                </div>
              </>
            )}

            <div className="flex items-end">
              <button
                onClick={run}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading ? "..." : lang === "tr" ? "Çalıştır" : "Run"}
              </button>
            </div>
          </div>
        </Card>
      </div>

      {result && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Stat label={lang === "tr" ? "Toplam Getiri" : "Total Return"} value={`${result.totalReturnPercent >= 0 ? "+" : ""}${result.totalReturnPercent}%`} positive={result.totalReturnPercent >= 0} />
            <Stat label={lang === "tr" ? "Final Değer" : "Final Value"} value={formatCurrency(result.finalCapital)} />
            <Stat label={lang === "tr" ? "İşlem Sayısı" : "Trades"} value={String(result.totalTrades)} />
            <Stat label={lang === "tr" ? "Kazanma Oranı" : "Win Rate"} value={`${result.winRate}%`} />
            <Stat label={lang === "tr" ? "Max Drawdown" : "Max Drawdown"} value={`-${result.maxDrawdownPercent}%`} positive={false} />
            <Stat label="Sharpe" value={result.sharpeRatio.toFixed(2)} positive={result.sharpeRatio > 0} />
          </div>

          <Card title={lang === "tr" ? "Equity Eğrisi" : "Equity Curve"}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={result.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`} width={60} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} name={symbol} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </AppShell>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${positive === true ? "text-emerald-600" : positive === false ? "text-red-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}
