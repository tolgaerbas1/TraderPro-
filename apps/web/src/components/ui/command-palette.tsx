"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, TrendingUp, LayoutDashboard, List, ScanSearch, Wallet, BarChart3, Bot, Settings, DollarSign } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DEFAULT_WATCHLIST } from "@/lib/stocks";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: "page" | "stock" | "action";
}

export function CommandPalette() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const pages: CommandItem[] = [
    { id: "dashboard", label: t.nav.dashboard, description: lang === "tr" ? "Ana panel" : "Widget dashboard", icon: <LayoutDashboard className="h-4 w-4" />, action: () => router.push("/"), category: "page" },
    { id: "watchlist", label: t.nav.watchlist, description: lang === "tr" ? "İzleme listesi" : "Full watchlist", icon: <List className="h-4 w-4" />, action: () => router.push("/watchlist"), category: "page" },
    { id: "radar", label: t.nav.radar, description: lang === "tr" ? "Hisse tarama" : "Stock screening", icon: <ScanSearch className="h-4 w-4" />, action: () => router.push("/radar"), category: "page" },
    { id: "portfolio", label: t.nav.portfolio, description: lang === "tr" ? "Portföy yönetimi" : "Portfolio management", icon: <Wallet className="h-4 w-4" />, action: () => router.push("/portfolio"), category: "page" },
    { id: "performance", label: t.nav.performance, description: lang === "tr" ? "K/Z analizi" : "P&L analysis", icon: <BarChart3 className="h-4 w-4" />, action: () => router.push("/performance"), category: "page" },
    { id: "agents", label: t.nav.agents, description: lang === "tr" ? "Agent merkezi" : "Agent hub", icon: <Bot className="h-4 w-4" />, action: () => router.push("/agents"), category: "page" },
    { id: "settings", label: t.nav.settings, description: lang === "tr" ? "Ayarlar" : "App settings", icon: <Settings className="h-4 w-4" />, action: () => router.push("/settings"), category: "page" },
    { id: "news", label: lang === "tr" ? "Haberler" : "News", description: lang === "tr" ? "Haber akışı" : "News feed", icon: <Search className="h-4 w-4" />, action: () => router.push("/news"), category: "page" },
    { id: "investors", label: lang === "tr" ? "Yatırımcılar" : "Investors", description: lang === "tr" ? "Ünlü portföyleri" : "Famous portfolios", icon: <DollarSign className="h-4 w-4" />, action: () => router.push("/investors"), category: "page" },
    { id: "backtest", label: lang === "tr" ? "Backtest" : "Backtest", description: lang === "tr" ? "Strateji testi" : "Strategy tester", icon: <TrendingUp className="h-4 w-4" />, action: () => router.push("/backtest"), category: "page" },
  ];

  const stocks = DEFAULT_WATCHLIST.map((s): CommandItem => ({
    id: `stock-${s.symbol}`,
    label: s.symbol,
    description: `${s.name} · ${s.exchange}`,
    icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    action: () => router.push(`/stock/${s.symbol}`),
    category: "stock",
  }));

  const quickActions: CommandItem[] = [
    { id: "order-buy", label: lang === "tr" ? "Alış emri" : "Buy order", description: lang === "tr" ? "Portföy sayfasına git" : "Go to portfolio", icon: <DollarSign className="h-4 w-4 text-emerald-500" />, action: () => router.push("/portfolio"), category: "action" },
    { id: "scan-buys", label: lang === "tr" ? "AL sinyali tara" : "Scan BUY signals", description: lang === "tr" ? "Konsensüs AL olanlar" : "Consensus BUY screening", icon: <ScanSearch className="h-4 w-4 text-emerald-500" />, action: () => router.push("/radar"), category: "action" },
  ];

  const allItems = [...pages, ...stocks, ...quickActions];

  const filtered = query
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const grouped = {
    page: filtered.filter((i) => i.category === "page"),
    stock: filtered.filter((i) => i.category === "stock"),
    action: filtered.filter((i) => i.category === "action"),
  };

  const flatGrouped = [...grouped.page, ...grouped.stock, ...grouped.action];
  const safeSelected = Math.min(selected, flatGrouped.length - 1);

  const execute = useCallback(
    (item: CommandItem) => {
      item.action();
      setOpen(false);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, flatGrouped.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && flatGrouped[safeSelected]) {
        execute(flatGrouped[safeSelected]);
      }
    },
    [flatGrouped, safeSelected, execute]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={lang === "tr" ? "Hisse ara, sayfaya git..." : "Search stocks, navigate..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) =>
            items.length > 0 ? (
              <div key={category} className="mb-2">
                <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  {category === "page" ? (lang === "tr" ? "Sayfalar" : "Pages") : category === "stock" ? (lang === "tr" ? "Hisseler" : "Stocks") : (lang === "tr" ? "Aksiyonlar" : "Actions")}
                </div>
                {items.map((item) => {
                  const idx = flatGrouped.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => execute(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        idx === safeSelected
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                          : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto text-xs text-zinc-400">{item.description}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-300" />
                    </button>
                  );
                })}
              </div>
            ) : null
          )}

          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-zinc-400">
              {lang === "tr" ? "Sonuç bulunamadı." : "No results found."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400">
            <kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">↑↓</kbd> Navigate
          </span>
          <span className="text-[10px] text-zinc-400">
            <kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">↵</kbd> Select
          </span>
          <span className="text-[10px] text-zinc-400">
            <kbd className="rounded border border-zinc-300 px-1 py-0.5 dark:border-zinc-700">Ctrl+K</kbd> Toggle
          </span>
        </div>
      </div>
    </div>
  );
}
