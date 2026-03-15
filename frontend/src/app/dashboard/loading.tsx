import { StatsCardsSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <section>
        <StatsCardsSkeleton />
      </section>
      <section className="flex flex-wrap gap-4">
        <div className="h-12 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-12 w-40 animate-pulse rounded-lg bg-slate-200" />
      </section>
    </div>
  );
}
