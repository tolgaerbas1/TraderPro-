import { MockBroker } from "./mock-broker";
import { getPriceMap } from "@/lib/market-data";

/** Shared in-memory broker — all API routes use the same state */
export const broker = new MockBroker(getPriceMap);
