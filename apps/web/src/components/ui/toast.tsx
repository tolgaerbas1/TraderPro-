"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />,
    error: <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />,
    info: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-800",
    error: "border-red-200 dark:border-red-800",
    info: "border-blue-200 dark:border-blue-800",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg animate-in slide-in-from-right dark:bg-zinc-900",
        borders[t.variant]
      )}
    >
      {icons[t.variant]}
      <span className="text-sm">{t.message}</span>
      <button onClick={onClose} className="ml-2 shrink-0 rounded p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <X className="h-3.5 w-3.5 text-zinc-400" />
      </button>
    </div>
  );
}
