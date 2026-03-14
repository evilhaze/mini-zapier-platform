'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Canvas editor placeholder — n8n / Make / Node-RED style.
 * Replace with React Flow (or existing @xyflow/react) when wiring to API.
 */
export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <div className="flex h-[calc(100vh-var(--topbar-h)-3rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/workflows/${id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workflow
          </Link>
          <span className="text-slate-400">|</span>
          <span className="font-medium text-slate-900">Editor</span>
          <span className="text-sm text-slate-500">Workflow {id}</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-slate-50/50 p-8">
        <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-medium text-slate-700">Canvas editor</p>
          <p className="mt-2 text-sm text-slate-500">
            Drag-and-drop nodes and edges will go here. Wire this view to your
            React Flow (or existing @xyflow) implementation and
            GET/PUT /workflows/:id.
          </p>
          <Link
            href={`/workflows/${id}`}
            className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark"
          >
            View workflow detail →
          </Link>
        </div>
      </div>
    </div>
  );
}
