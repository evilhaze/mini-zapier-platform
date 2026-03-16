import { redirect } from 'next/navigation';

type Props = {
  params: { id: string };
};

export default function WorkflowRunRedirectPage({ params }: Props) {
  const { id } = params;
  redirect(`/executions?workflowId=${encodeURIComponent(id)}`);
}

