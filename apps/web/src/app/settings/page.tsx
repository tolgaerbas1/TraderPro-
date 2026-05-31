"use client";

import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from "react";

type BrokerMode = "mock" | "ibkr";

export default function SettingsPage() {
  const { t, lang, setLang, bilingual, setBilingual } = useLanguage();
  const { toast } = useToast();
  const [dark, setDark] = useState(false);
  const [brokerMode, setBrokerMode] = useState<BrokerMode>("mock");
  const [ibkrUrl, setIbkrUrl] = useState("");
  const [loadingBroker, setLoadingBroker] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("traderpro-theme");
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (!theme && prefersDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setDark(isDark);
  }, []);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
    localStorage.setItem("traderpro-theme", dark ? "light" : "dark");
  }

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setBrokerMode(d.mode ?? "mock");
        setIbkrUrl(d.ibkrGatewayUrl ?? "");
        setLoadingBroker(false);
      })
      .catch(() => setLoadingBroker(false));
  }, []);

  async function switchBroker(mode: BrokerMode) {
    setSwitching(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const data = await res.json();
    if (data.mode) {
      setBrokerMode(data.mode);
      if (mode === "ibkr") {
        toast("Switched to IBKR broker. Connect gateway to use.", "info");
      } else {
        toast("Switched to Mock broker");
      }
    } else {
      toast("Failed to switch broker", "error");
    }
    setSwitching(false);
  }

  async function saveIbkrUrl() {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ibkrGatewayUrl: ibkrUrl }),
    });
    toast("IBKR Gateway URL saved");
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">{t.settings.title}</h1>
      <div className="max-w-lg space-y-6">
        <Card title={t.settings.language}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLang("tr")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "tr" ? "bg-emerald-600 text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "en" ? "bg-emerald-600 text-white" : "border border-zinc-300 dark:border-zinc-700"}`}
              >
                English
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bilingual}
                onChange={(e) => setBilingual(e.target.checked)}
                className="rounded"
              />
              TR + EN (Both summaries)
            </label>
          </div>
        </Card>

        <Card title={t.settings.theme}>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {dark ? t.settings.lightMode : t.settings.darkMode}
          </button>
        </Card>

        <Card title={t.settings.broker}>
          {loadingBroker ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => switchBroker("mock")}
                  disabled={switching}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                    brokerMode === "mock"
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${brokerMode === "mock" ? "bg-white" : "bg-emerald-500"}`} />
                  {t.settings.brokerMock}
                </button>
                <button
                  onClick={() => switchBroker("ibkr")}
                  disabled={switching}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                    brokerMode === "ibkr"
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${brokerMode === "ibkr" ? "bg-white" : "bg-zinc-400"}`} />
                  {t.settings.brokerIBKR}
                </button>
              </div>

              {brokerMode === "ibkr" && (
                <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">IBKR Gateway URL</label>
                    <div className="flex gap-2">
                      <input
                        value={ibkrUrl}
                        onChange={(e) => setIbkrUrl(e.target.value)}
                        className="input-field flex-1"
                        placeholder="https://localhost:5000"
                      />
                      <button
                        onClick={saveIbkrUrl}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Requires IBKR Client Portal Gateway running. Set env <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">IBKR_GATEWAY_URL</code> or configure here.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
