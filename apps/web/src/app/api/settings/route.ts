import { NextResponse } from "next/server";
import { getBrokerConfig, setBrokerMode, setBrokerConfig } from "@/lib/broker/config";
import { resetBroker } from "@/lib/broker/instance";
import type { BrokerMode } from "@/lib/broker/config";

export async function GET() {
  const config = await getBrokerConfig();
  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.mode) {
    const mode = body.mode as BrokerMode;
    if (mode !== "mock" && mode !== "ibkr") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }
    await setBrokerMode(mode);
    resetBroker();
    const config = await getBrokerConfig();
    return NextResponse.json(config);
  }

  if (body.ibkrGatewayUrl) {
    await setBrokerConfig({ ibkrGatewayUrl: body.ibkrGatewayUrl });
    resetBroker();
    const config = await getBrokerConfig();
    return NextResponse.json(config);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
