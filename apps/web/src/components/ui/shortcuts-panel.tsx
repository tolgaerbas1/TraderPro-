"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { X, ArrowRight } from "lucide-react";

interface Shortcut {
  keys: string;
  descriptionEn: string;
  descriptionTr: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: "Ctrl+K", descriptionEn: "Command palette", descriptionTr: "Komut paleti" },
  { keys: "?", descriptionEn: "Show shortcuts", descriptionTr: "Kısayolları göster" },
  { keys: "G D", descriptionEn: "Go to Dashboard", descriptionTr: "Dashboard'a git" },
  { keys: "G W", descriptionEn: "Go to Watchlist", descriptionTr: "İzleme listesine git" },
  { keys: "G R", descriptionEn: "Go to Radar", descriptionTr: "Radar'a git" },
  { keys: "G P", descriptionEn: "Go to Portfolio", descriptionTr: "Portföye git" },
  { keys: "G A", descriptionEn: "Go to Agents", descriptionTr: "Agent'lara git" },
  { keys: "G N", descriptionEn: "Go to News", descriptionTr: "Haberler'e git" },
  { keys: "G I", descriptionEn: "Go to Investors", descriptionTr: "Yatırımcılara git" },
  { keys: "Esc", descriptionEn: "Close panel / modal", descriptionTr: "Paneli kapat" },
];

export function ShortcutsPanel() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement)?.matches?.("input, textarea, select")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) return;
      const key = e.key.toLowerCase();
      const goto: Record<string, string> = {
        gd: "/",
        gw: "/watchlist",
        gr: "/radar",
        gp: "/portfolio",
        ga: "/agents",
        gn: "/news",
        gi: "/investors",
      };

      let seq = (window as unknown as { __goto_seq?: string }).__goto_seq ?? "";
      seq += key;
      (window as unknown as { __goto_seq?: string }).__goto_seq = seq;

      if (goto[seq]) {
        e.preventDefault();
        router.push(goto[seq]);
        (window as unknown as { __goto_seq?: string }).__goto_seq = "";
      }
      if (seq.length > 2) {
        (window as unknown as { __goto_seq?: string }).__goto_seq = "";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <span className="font-semibold">{lang === "tr" ? "Klavye Kısayolları" : "Keyboard Shortcuts"}</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-zinc-400 dark:border-zinc-800">
                <th className="py-2 px-3 text-[10px] font-medium uppercase">{lang === "tr" ? "Kısayol" : "Shortcut"}</th>
                <th className="py-2 px-3 text-[10px] font-medium uppercase">{lang === "tr" ? "Açıklama" : "Description"}</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr key={s.keys} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 px-3">
                    <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-800">
                      {s.keys}
                    </kbd>
                  </td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">
                    {lang === "tr" ? s.descriptionTr : s.descriptionEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-100 px-4 py-2 text-[10px] text-zinc-400 dark:border-zinc-800">
          {lang === "tr" ? "G + harf ile sayfalar arası geçiş yapın" : "Use G + letter to navigate between pages"}
        </div>
      </div>
    </div>
  );
}
