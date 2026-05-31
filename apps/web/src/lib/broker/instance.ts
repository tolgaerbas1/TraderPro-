import { MockBroker } from "./mock-broker";
import { IbkrBroker } from "./ibkr-broker";
import { getBrokerConfig } from "./config";
import type { BrokerAdapter } from "./types";
import { getPriceMap } from "@/lib/market-data";

let _broker: BrokerAdapter | null = null;
let _currentMode: string | null = null;

export async function getBroker(): Promise<BrokerAdapter> {
  const config = await getBrokerConfig();

  if (_broker && _currentMode === config.mode) {
    return _broker;
  }

  if (config.mode === "ibkr") {
    _broker = new IbkrBroker({ gatewayUrl: config.ibkrGatewayUrl });
    _currentMode = "ibkr";
  } else {
    _broker = new MockBroker(getPriceMap);
    _currentMode = "mock";
  }

  return _broker;
}

export function resetBroker() {
  _broker = null;
  _currentMode = null;
}

/** Sync access for server components — always returns mock (fast path) */
import { MockBroker as Mock } from "./mock-broker";
export const broker = new Mock(getPriceMap);
