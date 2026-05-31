import { promises as fs } from "fs";
import path from "path";
import type { AgentWeights } from "./types";
import { DEFAULT_WEIGHTS } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "data", "agent-config.json");

export async function getAgentWeights(): Promise<AgentWeights> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_WEIGHTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_WEIGHTS };
  }
}

export async function saveAgentWeights(weights: AgentWeights): Promise<AgentWeights> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  const normalized = { ...DEFAULT_WEIGHTS, ...weights };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}
