'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { Sidebar } from '@/components/editor/Sidebar';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import type { DefinitionJson } from '@/components/editor/types';

type Workflow = {
  id: string;
  name: string;
  definitionJson: unknown;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getDefinitionRef = useRef<(() => DefinitionJson) | null>(null);

  // Load workflow on mount / id change
  useEffect(() => {
    if (!id) {
      setWorkflow(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(`${API_BASE}/workflows/${id}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('Workflow not found');
          throw new Error(`Failed to load (${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setWorkflow(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setWorkflow(null);
          setLoadError(e instanceof Error ? e.message : 'Failed to load workflow');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Clear "saved" state after delay
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const handleSave = useCallback(async () => {
    const getDef = getDefinitionRef.current;
    if (!getDef || !id) return;

    const definition = getDef();
    const hasNodes = Array.isArray(definition?.nodes) && definition.nodes.length > 0;

    if (!hasNodes) {
      setSaveStatus('error');
      setSaveErrorMessage('Add at least one node to save');
      return;
    }

    setSaveStatus('saving');
    setSaveErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionJson: definition }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      setSaveStatus('saved');
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
        savedTimeoutRef.current = null;
      }, 2500);
    } catch (e) {
      setSaveStatus('error');
      setSaveErrorMessage(e instanceof Error ? e.message : 'Save failed');
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-h)-3rem)] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
        <p className="text-sm text-slate-500">Loading workflow...</p>
      </div>
    );
  }

  if (loadError || !workflow) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Link href="/workflows" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Workflows
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError ?? 'Workflow not found'}
        </div>
        <p className="text-slate-600">The workflow may have been deleted or the link is incorrect.</p>
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
        <div className="flex items-center gap-3">
          {saveStatus === 'error' && saveErrorMessage && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveErrorMessage}
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="h-4 w-4 shrink-0" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
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
