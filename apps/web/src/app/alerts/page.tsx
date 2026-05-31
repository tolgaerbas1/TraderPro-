"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { Alert, AlertType } from "@/lib/alerts/store";
import { Bell, BellOff, Plus, Trash2, RefreshCw } from "lucide-react";

const ALERT_TYPES: { value: AlertType; labelEn: string; labelTr: string }[] = [
  { value: "price_above", labelEn: "Price Above", labelTr: "Fiyat Üstünde" },
  { value: "price_below", labelEn: "Price Below", labelTr: "Fiyat Altında" },
  { value: "change_pct", labelEn: "Change %", labelTr: "Değişim %" },
  { value: "agent_consensus", labelEn: "Agent Consensus", labelTr: "Agent Konsensüs" },
];

export default function AlertsPage() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ symbol: "AAPL", type: "price_above" as AlertType, threshold: "150" });

  async function load() {
    const res = await fetch("/api/alerts?check=true");
    const data = await res.json();
    setAlerts(data.alerts ?? []);
    if (data.triggered?.length > 0) {
      for (const a of data.triggered) {
        toast(`${a.symbol}: ${lang === "tr" ? a.messageTr : a.messageEn}`, "info");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        symbol: form.symbol.toUpperCase(),
        threshold: Number(form.threshold),
        active: true,
        messageEn: `${form.symbol} ${form.type.replace("_", " ")} ${form.threshold}`,
        messageTr: `${form.symbol} ${form.type === "price_above" ? "üstünde" : form.type === "price_below" ? "altında" : ""} ${form.threshold}`,
      }),
    });
    if (res.ok) {
      toast(lang === "tr" ? "Alarm oluşturuldu" : "Alert created");
      load();
    }
  }

  async function toggle(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle" }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    toast(lang === "tr" ? "Alarm silindi" : "Alert deleted");
    load();
  }

  const activeCount = alerts.filter((a) => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bell className="h-7 w-7 text-emerald-600" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Alarmlar" : "Alerts"}</h1>
        </div>
        <div className="flex gap-2">
          {triggeredCount > 0 && <Badge variant="warning">{triggeredCount} {lang === "tr" ? "tetiklendi" : "triggered"}</Badge>}
          {activeCount > 0 && <Badge variant="info">{activeCount} {lang === "tr" ? "aktif" : "active"}</Badge>}
          <button onClick={load} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <Card title={lang === "tr" ? "Yeni Alarm" : "New Alert"}>
          <form onSubmit={createAlert} className="flex flex-wrap gap-3">
            <input
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
              className="input-field w-24"
              placeholder="Symbol"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AlertType })}
              className="input-field w-44"
            >
              {ALERT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{lang === "tr" ? t.labelTr : t.labelEn}</option>
              ))}
            </select>
            <input
              type="number"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              className="input-field w-28"
              placeholder="Threshold"
            />
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
              <Plus className="mr-1 inline h-3 w-3" />
              {lang === "tr" ? "Ekle" : "Add"}
            </button>
          </form>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <p className="text-zinc-500">
            {lang === "tr" ? "Henüz alarm yok. Yukarıdan ekleyin." : "No alerts yet. Add one above."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={alert.active ? "text-emerald-500" : "text-zinc-300"}>
                    {alert.active ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/stock/${alert.symbol}`} className="font-medium text-emerald-600 hover:underline">
                        {alert.symbol}
                      </Link>
                      <Badge variant={alert.triggered ? "warning" : alert.active ? "info" : "default"}>
                        {alert.triggered
                          ? lang === "tr" ? "Tetiklendi" : "Triggered"
                          : alert.active
                            ? lang === "tr" ? "Aktif" : "Active"
                            : lang === "tr" ? "Pasif" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {ALERT_TYPES.find((t) => t.value === alert.type)?.[lang === "tr" ? "labelTr" : "labelEn"]}: {alert.threshold}
                    </div>
                    {alert.triggeredAt && (
                      <div className="text-xs text-zinc-400">
                        {new Date(alert.triggeredAt).toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(alert.id)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                  >
                    {alert.active ? (lang === "tr" ? "Durdur" : "Pause") : (lang === "tr" ? "Başlat" : "Start")}
                  </button>
                  <button
                    onClick={() => remove(alert.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 dark:border-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
