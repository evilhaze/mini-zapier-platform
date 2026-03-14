'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { Sidebar } from '@/components/editor/Sidebar';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import type { DefinitionJson } from '@/components/editor/types';

type Workflow = {
  id: string;
  name: string;
  definitionJson: unknown;
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const getDefinitionRef = useRef<(() => DefinitionJson) | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/workflows/${id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then((data) => {
        if (!cancelled) setWorkflow(data);
      })
      .catch(() => {
        if (!cancelled) setWorkflow(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = useCallback(async () => {
    const getDef = getDefinitionRef.current;
    if (!getDef || !id) return;
    const definition = getDef();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionJson: definition }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-h)-3rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Link href="/workflows" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Workflows
        </Link>
        <p className="text-slate-600">Workflow not found.</p>
      </div>
    );
  }

  const definition = (workflow.definitionJson ?? { nodes: [], edges: [] }) as DefinitionJson;

  return (
    <div className="flex h-[calc(100vh-var(--topbar-h)-3rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/workflows/${id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-slate-400">|</span>
          <span className="font-medium text-slate-900">{workflow.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      {/* Editor: Sidebar + Canvas + Settings (inside canvas) */}
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <WorkflowCanvas
          key={id}
          initialDefinition={definition}
          getDefinitionRef={getDefinitionRef}
        />
      </div>
    </div>
  );
}
