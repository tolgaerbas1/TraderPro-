import { promises as fs } from "fs";
import path from "path";

export type BrokerMode = "mock" | "ibkr";

interface BrokerConfig {
  mode: BrokerMode;
  ibkrGatewayUrl: string;
}

const CONFIG_PATH = path.join(process.cwd(), "data", "broker-config.json");

const DEFAULT_CONFIG: BrokerConfig = {
  mode: "mock",
  ibkrGatewayUrl: process.env.IBKR_GATEWAY_URL ?? "https://localhost:5000",
};

export async function getBrokerConfig(): Promise<BrokerConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function setBrokerMode(mode: BrokerMode): Promise<BrokerConfig> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  const config = { ...DEFAULT_CONFIG, mode };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  return config;
}

export async function setBrokerConfig(partial: Partial<BrokerConfig>): Promise<BrokerConfig> {
  const current = await getBrokerConfig();
  const config = { ...current, ...partial };
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  return config;
}
