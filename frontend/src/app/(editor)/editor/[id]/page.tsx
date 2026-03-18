'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import type { DefinitionJson } from '@/components/editor/types';
import { API_BASE } from '@/lib/api';
import { CopyButton } from '@/components/ui/CopyButton';

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [definition, setDefinition] = useState<DefinitionJson | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [baselineSig, setBaselineSig] = useState<string>('');
  const getDefinitionRef = useRef<(() => DefinitionJson) | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/workflows/${id}`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to load workflow');
        const data = await res.json();
        if (!cancelled) {
          const name =
            typeof (data as { name?: unknown }).name === 'string'
              ? ((data as { name: string }).name ?? '')
              : typeof (data as { title?: unknown }).title === 'string'
                ? ((data as { title: string }).title ?? '')
                : '';
          setWorkflowName(name);

          let def: DefinitionJson | null = null;
          const raw = (data.definitionJson ?? data.definition) as unknown;
          try {
            if (typeof raw === 'string') {
              def = JSON.parse(raw) as DefinitionJson;
            } else if (raw && typeof raw === 'object') {
              def = raw as DefinitionJson;
            }
          } catch {
            def = null;
          }
          setDefinition(def);
          setBaselineSig(JSON.stringify(def ?? { nodes: [], edges: [] }));
          setDirty(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load workflow');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    if (!getDefinitionRef.current) return;
    const nextDef = getDefinitionRef.current();
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionJson: nextDef }),
      });
      if (!res.ok) throw new Error('Failed to save workflow');
      toast.success('Workflow saved');
      const sig = JSON.stringify(nextDef ?? { nodes: [], edges: [] });
      setBaselineSig(sig);
      setDirty(false);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-slate-500">Loading editor…</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white px-6 py-5 text-sm text-slate-600 shadow-card">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/workflows')}
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100">
      <div className="flex h-full flex-col gap-3 px-6 py-3">
        {/* Top bar for editor */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Workflow editor
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {workflowName?.trim() ? workflowName.trim() : 'Untitled workflow'}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="truncate text-xs text-slate-500">{id}</span>
              <CopyButton
                value={id}
                label="Copy ID"
                copiedLabel="Copied"
                className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                dirty
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {dirty ? 'Unsaved changes' : 'Saved'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Canvas workspace - full area */}
        <div className="flex-1 min-h-0 flex">
          <WorkflowCanvas
            workflowId={String(id)}
            initialDefinition={definition}
            getDefinitionRef={getDefinitionRef}
            baselineSignature={baselineSig}
            onDirtyChange={setDirty}
          />
        </div>
      </div>
    </div>
  );
}

