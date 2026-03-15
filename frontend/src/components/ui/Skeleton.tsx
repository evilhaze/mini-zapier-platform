'use client';

type Props = {
  className?: string;
};

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
      aria-hidden
    />
  );
}

/** Skeleton for a stats card (dashboard style) */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-slate-200/80 bg-white p-5 shadow-card">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  );
}

/** Grid of stat cards skeleton */
export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Single table row skeleton - variable cells */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="divide-y divide-slate-200">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="whitespace-nowrap px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Full table skeleton with header and N rows */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  headerLabels,
}: {
  rows?: number;
  cols?: number;
  headerLabels?: string[];
}) {
  return (
    <div className="overflow-hidden rounded-card border border-slate-200/80 bg-white shadow-card">
      <table className="min-w-full divide-y divide-slate-200/80">
        <thead>
          <tr className="bg-slate-50/80">
            {headerLabels
              ? headerLabels.map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {label}
                  </th>
                ))
              : Array.from({ length: cols }).map((_, i) => (
                  <th key={i} scope="col" className="px-5 py-3.5">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Grid of list item cards (e.g. editor workflow list) */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="flex items-center gap-3 rounded-card border border-slate-200/80 bg-white p-4">
            <Skeleton className="h-5 w-5 shrink-0 rounded" />
            <Skeleton className="h-5 flex-1 max-w-[180px]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Execution detail page skeleton - summary block + steps */
export function ExecutionDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="rounded-card border border-slate-200/80 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-6 w-64" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full max-w-xs" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
