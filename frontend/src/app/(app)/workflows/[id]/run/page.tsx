import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowRunRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/executions?workflowId=${encodeURIComponent(id)}`);
}

