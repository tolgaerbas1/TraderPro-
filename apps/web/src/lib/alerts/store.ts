export type AlertType = "price_above" | "price_below" | "change_pct" | "agent_consensus";

export interface Alert {
  id: string;
  type: AlertType;
  symbol: string;
  threshold: number;
  active: boolean;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
  messageEn: string;
  messageTr: string;
}

let alerts: Alert[] = [
  {
    id: "alert_seed_1",
    type: "price_above",
    symbol: "NVDA",
    threshold: 140,
    active: true,
    triggered: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    messageEn: "NVDA above $140",
    messageTr: "NVDA $140 üstünde",
  },
  {
    id: "alert_seed_2",
    type: "price_below",
    symbol: "TSLA",
    threshold: 230,
    active: true,
    triggered: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    messageEn: "TSLA below $230",
    messageTr: "TSLA $230 altında",
  },
];

export function getAlerts(): Alert[] {
  return alerts;
}

export function addAlert(alert: Omit<Alert, "id" | "triggered" | "createdAt">): Alert {
  const newAlert: Alert = {
    ...alert,
    id: `alert_${Date.now()}`,
    triggered: false,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  return newAlert;
}

export function deleteAlert(id: string): boolean {
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    alerts.splice(idx, 1);
    return true;
  }
  return false;
}

export function toggleAlert(id: string): Alert | null {
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.active = !alert.active;
    return alert;
  }
  return null;
}

export function checkAlerts(
  prices: Record<string, number>,
  consensus?: Record<string, "buy" | "sell" | "hold">
): Alert[] {
  const triggered: Alert[] = [];
  for (const alert of alerts) {
    if (!alert.active || alert.triggered) continue;
    const price = prices[alert.symbol];
    if (price == null) continue;

    let shouldTrigger = false;
    switch (alert.type) {
      case "price_above":
        shouldTrigger = price >= alert.threshold;
        break;
      case "price_below":
        shouldTrigger = price <= alert.threshold;
        break;
      case "change_pct":
        shouldTrigger = Math.abs(price - alert.threshold) / alert.threshold >= 0.05;
        break;
      case "agent_consensus":
        shouldTrigger = consensus?.[alert.symbol] === (alert.threshold === 1 ? "buy" : alert.threshold === -1 ? "sell" : "hold");
        break;
    }

    if (shouldTrigger) {
      alert.triggered = true;
      alert.triggeredAt = new Date().toISOString();
      triggered.push(alert);
    }
  }
  return triggered;
}

export function resetAlert(id: string): Alert | null {
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.triggered = false;
    alert.triggeredAt = undefined;
    return alert;
  }
  return null;
}
