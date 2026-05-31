"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Card, Badge } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { BellRing, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = "traderpro-notifications";

function loadStored(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function NotificationsPage() {
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(loadStored());
  }, []);

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-7 w-7 text-emerald-600" />
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Bildirimler" : "Notifications"}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
            {lang === "tr" ? "Tümünü Okundu" : "Mark All Read"}
          </button>
          <button onClick={clearAll} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
            {lang === "tr" ? "Temizle" : "Clear"}
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <p className="text-zinc-500">
            {lang === "tr" ? "Henüz bildirim yok." : "No notifications yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border bg-white p-4 ${n.read ? "opacity-60" : ""} dark:bg-zinc-900 dark:border-zinc-800`}
            >
              <span className="mt-0.5 shrink-0">{icons[n.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="text-[10px] text-zinc-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && <Badge variant="info">{lang === "tr" ? "Yeni" : "New"}</Badge>}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
