import { CardGridSkeleton } from '@/components/ui/Skeleton';

export default function EditorLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-slate-200" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
