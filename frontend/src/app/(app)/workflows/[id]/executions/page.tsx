import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowExecutionsRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/executions?workflowId=${encodeURIComponent(id)}`);
}

