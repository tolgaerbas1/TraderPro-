"use client";

import { AppShell } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { t, lang, setLang, bilingual, setBilingual } = useLanguage();
  const [dark, setDark] = useState(false);

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
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.settings.brokerMock}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-zinc-500 dark:bg-zinc-800">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              {t.settings.brokerIBKR}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
