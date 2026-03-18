import { Suspense } from 'react';
import { WorkflowList } from '@/components/workflows/WorkflowList';

export default function WorkflowsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading workflows...</div>}>
      <WorkflowList />
    </Suspense>
  );
}
