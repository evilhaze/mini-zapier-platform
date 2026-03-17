'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, GitBranch, ChevronRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { NODE_LABELS } from '@/components/editor/types';
import type { WorkflowDraft } from '@/lib/ai-api';

type Props = {
  open: boolean;
  onClose: () => void;
  draft: WorkflowDraft | null;
};

export function AIDraftPreviewModal({ open, onClose, draft }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDraft = async () => {
    if (!draft) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description || undefined,
          status: 'draft',
          isPaused: false,
          definitionJson: draft.definitionJson,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      const id = (data as { id: string }).id;
      onClose();
      router.push(`/editor/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !draft) return null;

  const nodes = draft.definitionJson.nodes ?? [];
  const trigger = nodes.find((n) => ['webhook', 'schedule', 'manual', 'email'].includes(n.type));
  const actions = nodes.filter((n) => !['webhook', 'schedule', 'manual', 'email'].includes(n.type));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ai-draft-title">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
          <h2 id="ai-draft-title" className="text-lg font-semibold text-slate-900">
            Workflow draft
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
            <p className="mt-1 font-medium text-slate-900">{draft.name}</p>
          </div>
          {draft.description && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-600">{draft.description}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Steps</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
              {trigger && (
                <span className="rounded-md bg-[#F6E3EA] px-2 py-1 text-[#B86B7C] font-medium">
                  {NODE_LABELS[trigger.type] ?? trigger.type}
                </span>
              )}
              {actions.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1.5">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="rounded-md bg-red-50 px-2 py-1 text-red-700 font-medium">
                    {NODE_LABELS[n.type] ?? n.type}
                  </span>
                </span>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200/80 px-5 py-4 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateDraft}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <GitBranch className="h-4 w-4" />
                Create draft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
