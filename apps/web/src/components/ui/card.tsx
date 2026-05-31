import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {title && (
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info";
}) {
  const variants = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

export function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={cn("font-medium tabular-nums", positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function ConsensusBadge({ action, lang }: { action: string; lang: "tr" | "en" }) {
  const labels = {
    buy: lang === "tr" ? "AL" : "BUY",
    sell: lang === "tr" ? "SAT" : "SELL",
    hold: lang === "tr" ? "BEKLE" : "HOLD",
  };
  const variant = action === "buy" ? "success" : action === "sell" ? "danger" : "warning";
  return <Badge variant={variant}>{labels[action as keyof typeof labels] ?? action}</Badge>;
}
