import { AppShell } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Skeleton className="h-10 w-44" />
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="col-span-4 h-[200px]" />
          <Skeleton className="col-span-4 h-[200px]" />
          <Skeleton className="col-span-4 h-[360px]" />
          <Skeleton className="col-span-4 h-[280px]" />
          <Skeleton className="col-span-4 h-[280px]" />
          <Skeleton className="col-span-4 h-[220px]" />
          <Skeleton className="col-span-4 h-[220px]" />
        </div>
      </div>
    </AppShell>
  );
}
