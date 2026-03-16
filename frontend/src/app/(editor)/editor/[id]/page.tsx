'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import type { DefinitionJson } from '@/components/editor/types';
import { API_BASE } from '@/lib/api';

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [definition, setDefinition] = useState<DefinitionJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const res = await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionJson: nextDef }),
      });
      if (!res.ok) throw new Error('Failed to save workflow');
    } catch (e) {
      console.error(e);
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
              {id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-red-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Canvas workspace - full area */}
        <div className="flex-1 min-h-0 flex">
          <WorkflowCanvas initialDefinition={definition} getDefinitionRef={getDefinitionRef} />
        </div>
      </div>
    </div>
  );
}

