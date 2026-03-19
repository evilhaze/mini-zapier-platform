import { fetchExecutionById } from '@/lib/executions-api';
import { ExecutionDetailView } from '@/components/executions/ExecutionDetailView';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExecutionDetailPage({ params }: Props) {
  const { id } = await params;

  const initialExecution = await fetchExecutionById(id).catch(() => null);

  return <ExecutionDetailView executionId={id} initialExecution={initialExecution} />;
}
