"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  LayoutDashboard,
  List,
  ScanSearch,
  Wallet,
  BarChart3,
  Bot,
  Settings,
  TrendingUp,
  Menu,
  X,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { CommandPalette } from "@/components/ui/command-palette";
import { ShortcutsPanel } from "@/components/ui/shortcuts-panel";

const navItems = [
  { href: "/", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/watchlist", icon: List, key: "watchlist" as const },
  { href: "/radar", icon: ScanSearch, key: "radar" as const },
  { href: "/portfolio", icon: Wallet, key: "portfolio" as const },
  { href: "/performance", icon: BarChart3, key: "performance" as const },
  { href: "/agents", icon: Bot, key: "agents" as const },
  { href: "/notifications", icon: BellRing, key: "notifications" as const, badge: true },
  { href: "/settings", icon: Settings, key: "settings" as const },
];

interface SidebarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({ open: false, setOpen: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { open, setOpen } = useSidebar();
  const [brokerLabel, setBrokerLabel] = useState("...");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setBrokerLabel(d.mode === "ibkr" ? "IBKR · Live" : "Mock Broker"))
      .catch(() => setBrokerLabel("Mock Broker"));
  }, []);

  useEffect(() => {
    const check = () => {
      try {
        const notifications = JSON.parse(localStorage.getItem("traderpro-notifications") ?? "[]");
        setUnreadCount(notifications.filter((n: { read?: boolean }) => !n.read).length);
      } catch { /* */ }
    };
    check();
    const interval = setInterval(check, 3000);
    window.addEventListener("traderpro-notif", check);
    return () => { clearInterval(interval); window.removeEventListener("traderpro-notif", check); };
  }, []);

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950",
          "lg:z-40 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <TrendingUp className="h-6 w-6 shrink-0 text-emerald-600" />
          <span className="text-lg font-bold tracking-tight">{t.appName}</span>
          <button
            onClick={close}
            className="ml-auto rounded-lg p-1 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ href, icon: Icon, key, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{t.nav[key]}</span>
                {badge && unreadCount > 0 && (
                  <span className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    active ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"
                  )}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className={cn(
            "rounded-lg px-3 py-2 text-xs",
            brokerLabel.startsWith("IBKR")
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
          )}>
            {brokerLabel}
          </div>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <Sidebar />

        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-3 z-30 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm lg:hidden dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="min-h-screen p-6 pt-14 lg:ml-56 lg:pt-6">{children}</main>
        <CommandPalette />
        <ShortcutsPanel />
      </div>
    </SidebarContext.Provider>
  );
}
