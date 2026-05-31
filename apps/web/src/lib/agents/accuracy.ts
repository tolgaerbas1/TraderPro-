import { promises as fs } from "fs";
import path from "path";
import type { AgentAccuracyStat, FullStockAnalysis } from "./types";
import type { AgentId } from "./types";
import { directionScore } from "./types";

interface PredictionRecord {
  id: string;
  symbol: string;
  agent: AgentId;
  direction: string;
  consensus: string;
  priceAtPrediction: number;
  createdAt: string;
  /** Simulated outcome for demo — based on current price drift */
  outcome?: "correct" | "incorrect" | "pending";
}

const STORE_PATH = path.join(process.cwd(), "data", "agent-accuracy.json");

async function loadRecords(): Promise<PredictionRecord[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return seedDemoRecords();
  }
}

function seedDemoRecords(): PredictionRecord[] {
  const agents: AgentId[] = ["fundamental", "technical", "regime", "risk"];
  const records: PredictionRecord[] = [];
  const symbols = ["NVDA", "AAPL", "MSFT", "META", "GOOGL"];

  for (let i = 0; i < 40; i++) {
    const agent = agents[i % 4];
    const symbol = symbols[i % 5];
    const direction = i % 3 === 0 ? "long" : i % 3 === 1 ? "short" : "neutral";
    records.push({
      id: `pred_seed_${i}`,
      symbol,
      agent,
      direction,
      consensus: direction === "long" ? "buy" : direction === "short" ? "sell" : "hold",
      priceAtPrediction: 100 + i * 5,
      createdAt: new Date(Date.now() - (40 - i) * 86400000).toISOString(),
      outcome: i % 5 === 0 ? "incorrect" : "correct",
    });
  }
  return records;
}

async function saveRecords(records: PredictionRecord[]) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const trimmed = records.slice(-500);
  await fs.writeFile(STORE_PATH, JSON.stringify(trimmed, null, 2));
}

export async function recordPrediction(
  analysis: FullStockAnalysis,
  price: number
): Promise<void> {
  const records = await loadRecords();
  const now = new Date().toISOString();

  for (const agent of analysis.agents) {
    if (agent.agent === "risk") continue;
    records.push({
      id: `pred_${Date.now()}_${agent.agent}`,
      symbol: analysis.symbol,
      agent: agent.agent,
      direction: agent.direction,
      consensus: analysis.consensus,
      priceAtPrediction: price,
      createdAt: now,
      outcome: "pending",
    });
  }

  await saveRecords(records);
}

export async function getAccuracyStats(): Promise<AgentAccuracyStat[]> {
  const records = await loadRecords();
  const agents: AgentId[] = ["fundamental", "technical", "regime", "risk"];

  return agents.map((agent) => {
    const agentRecords = records.filter((r) => r.agent === agent && r.outcome !== "pending");
    const total = agentRecords.length || 1;
    const correct = agentRecords.filter((r) => r.outcome === "correct").length;
    // Demo fallback accuracy when no resolved records
    const demoAccuracy = { fundamental: 68, technical: 72, regime: 61, risk: 85 }[agent];
    return {
      agent,
      totalPredictions: agentRecords.length || 30,
      correctPredictions: correct || Math.round((demoAccuracy / 100) * 30),
      accuracy: agentRecords.length > 0 ? (correct / total) * 100 : demoAccuracy,
    };
  });
}

export async function evaluatePendingRecords(
  getCurrentPrice: (symbol: string) => Promise<number>
): Promise<void> {
  const records = await loadRecords();
  let changed = false;

  for (const r of records) {
    if (r.outcome !== "pending") continue;
    const age = Date.now() - new Date(r.createdAt).getTime();
    if (age < 86400000) continue; // wait 1 day

    try {
      const current = await getCurrentPrice(r.symbol);
      const drift = (current - r.priceAtPrediction) / r.priceAtPrediction;
      const predictedUp = directionScore(r.direction as "long" | "short" | "neutral") > 0;
      const predictedDown = directionScore(r.direction as "long" | "short" | "neutral") < 0;

      if (Math.abs(drift) < 0.005) {
        r.outcome = "correct"; // neutral zone
      } else if ((predictedUp && drift > 0) || (predictedDown && drift < 0)) {
        r.outcome = "correct";
      } else if (r.direction === "neutral") {
        r.outcome = Math.abs(drift) < 0.02 ? "correct" : "incorrect";
      } else {
        r.outcome = "incorrect";
      }
      changed = true;
    } catch {
      /* skip */
    }
  }

  if (changed) await saveRecords(records);
}
