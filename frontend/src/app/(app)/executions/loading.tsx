import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ExecutionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
      <TableSkeleton
        rows={8}
        cols={7}
        headerLabels={[
          'Workflow',
          'Trigger',
          'Status',
          'Started',
          'Finished',
          'Duration',
          '',
        ]}
      />
    </div>
  );
}
