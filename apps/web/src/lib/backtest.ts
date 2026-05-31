export type StrategyType = "ma_crossover" | "rsi";

export interface BacktestResult {
  symbol: string;
  strategy: StrategyType;
  params: Record<string, number>;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  benchmarkReturnPercent: number;
  equityCurve: { date: string; value: number }[];
}

function generatePriceData(
  startPrice: number,
  days: number,
  volatility = 0.015
): number[] {
  const prices: number[] = [startPrice];
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.48) * volatility;
    prices.push(prices[i - 1] * (1 + change));
  }
  return prices;
}

function sma(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

function rsi(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
      continue;
    }
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    if (avgLoss === 0) result.push(100);
    else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

export function runBacktest(
  symbol: string,
  strategy: StrategyType,
  params: Record<string, number>,
  periodMonths = 12
): BacktestResult {
  const days = periodMonths * 21;
  const startPrice = 100 + Math.random() * 400;

  const prices = generatePriceData(startPrice, days);
  const capital = 10000;
  const dates: string[] = [];

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const equityCurve: { date: string; value: number }[] = [{ date: dates[0], value: capital }];
  let cash = capital;
  let position = 0;
  let entryPrice = 0;
  let wins = 0;
  let totalTrades = 0;
  let peakValue = capital;
  let maxDrawdown = 0;

  if (strategy === "ma_crossover") {
    const fast = params.fast ?? 20;
    const slow = params.slow ?? 50;
    const fastSma = sma(prices, fast);
    const slowSma = sma(prices, slow);

    for (let i = 1; i < prices.length; i++) {
      if (fastSma[i] == null || slowSma[i] == null) {
        equityCurve.push({ date: dates[i], value: cash + position * prices[i] });
        continue;
      }

      const prevFast = fastSma[i - 1]!;
      const prevSlow = slowSma[i - 1]!;
      const currFast = fastSma[i]!;
      const currSlow = slowSma[i]!;

      if (prevFast <= prevSlow && currFast > currSlow && position === 0) {
        position = Math.floor(cash / prices[i]);
        entryPrice = prices[i];
        cash -= position * prices[i];
        totalTrades++;
      } else if (prevFast >= prevSlow && currFast < currSlow && position > 0) {
        const exitValue = position * prices[i];
        cash += exitValue;
        if (prices[i] > entryPrice) wins++;
        position = 0;
      }

      const currentValue = cash + position * prices[i];
      equityCurve.push({ date: dates[i], value: Math.round(currentValue * 100) / 100 });
      if (currentValue > peakValue) peakValue = currentValue;
      const drawdown = (peakValue - currentValue) / peakValue;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
  } else if (strategy === "rsi") {
    const period = params.period ?? 14;
    const oversold = params.oversold ?? 30;
    const overbought = params.overbought ?? 70;
    const rsiValues = rsi(prices, period);

    for (let i = 1; i < prices.length; i++) {
      if (rsiValues[i] == null) {
        equityCurve.push({ date: dates[i], value: cash + position * prices[i] });
        continue;
      }

      if (rsiValues[i]! < oversold && position === 0) {
        position = Math.floor(cash / prices[i]);
        entryPrice = prices[i];
        cash -= position * prices[i];
        totalTrades++;
      } else if (rsiValues[i]! > overbought && position > 0) {
        const exitValue = position * prices[i];
        cash += exitValue;
        if (prices[i] > entryPrice) wins++;
        position = 0;
      }

      const currentValue = cash + position * prices[i];
      equityCurve.push({ date: dates[i], value: Math.round(currentValue * 100) / 100 });
      if (currentValue > peakValue) peakValue = currentValue;
      const drawdown = (peakValue - currentValue) / peakValue;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
  }

  const finalValue = cash + position * prices[prices.length - 1];
  const totalReturn = finalValue - capital;
  const totalReturnPercent = (totalReturn / capital) * 100;

  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value);
  }
  const avgReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const stdDev = Math.sqrt(
    returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (returns.length || 1)
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const endDate = dates[dates.length - 1];
  const startDate = dates[0];

  return {
    symbol,
    strategy,
    params,
    startDate,
    endDate,
    initialCapital: capital,
    finalCapital: Math.round(finalValue * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    winRate: totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0,
    totalTrades,
    winningTrades: wins,
    maxDrawdownPercent: Math.round(maxDrawdown * 10000) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    benchmarkReturnPercent: Math.round((Math.random() * 30 - 5) * 100) / 100,
    equityCurve,
  };
}
