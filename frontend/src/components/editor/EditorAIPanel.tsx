'use client';

import { useState, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, X, Loader2, Send, MessageSquare } from 'lucide-react';
import { sendEditorCommand, type EditorCommandResult, type EditorOperation } from '@/lib/ai-api';
import type { DefinitionJson } from './types';

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: 'Explain workflow', prompt: 'explain' },
  { label: 'Show missing fields', prompt: 'missing fields' },
  { label: 'Fix HTTP step', prompt: 'fix http request config for this node' },
  { label: 'Add Telegram step', prompt: 'add telegram after this' },
  { label: 'Add error handling', prompt: 'add error handling' },
];

type Props = {
  getDefinition: () => DefinitionJson;
  selectedNodeId: string | null;
  selectedNodeLabel: string | null;
  workflowName?: string;
  onApplyOperations: (operations: EditorOperation[]) => void;
  onClose?: () => void;
};

export function EditorAIPanel({
  getDefinition,
  selectedNodeId,
  selectedNodeLabel,
  workflowName,
  onApplyOperations,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EditorCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ prompt: string; result: EditorCommandResult }>>([]);
  const [pendingOps, setPendingOps] = useState<EditorOperation[] | null>(null);

  const runCommand = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      setResult(null);
      setPendingOps(null);
      try {
        const def = getDefinition();
        const res = await sendEditorCommand(
          { nodes: def.nodes, edges: def.edges },
          trimmed,
          selectedNodeId
        );
        setResult(res);
        setHistory((prev) => [{ prompt: trimmed, result: res }, ...prev.slice(0, 9)]);
        if (res.type === 'apply_operations' && res.operations.length > 0) {
          setPendingOps(res.operations);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Command failed');
      } finally {
        setLoading(false);
      }
    },
    [selectedNodeId, getDefinition]
  );

  const applyPending = useCallback(() => {
    if (pendingOps?.length) {
      onApplyOperations(pendingOps);
      setPendingOps(null);
    }
  }, [pendingOps, onApplyOperations]);

  const cancelPending = useCallback(() => {
    setPendingOps(null);
  }, []);

  const handleSubmit = useCallback(() => {
    runCommand(prompt);
    setPrompt('');
  }, [prompt, runCommand]);

  const handleQuickAction = useCallback(
    (promptText: string) => {
      setPrompt(promptText);
      runCommand(promptText);
    },
    [runCommand]
  );

  return (
    <div className="flex flex-col items-end">
      {/* Pill button — always visible, high contrast */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 hover:shadow-violet-500/30 active:bg-violet-800 transition-all duration-200 border border-violet-500/20"
        aria-expanded={open}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        <span>AI Assistant</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-14 z-[101] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800"
          style={{ maxHeight: 'min(560px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-600">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  AI Assistant
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Edit your workflow with natural language
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => !c)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label={collapsed ? 'Expand' : 'Collapse'}
                >
                  {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* Body — scrollable */}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {/* Context */}
                <div className="shrink-0 border-b border-slate-100 px-4 py-2.5 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/80">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Context
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 truncate">
                    Workflow: {workflowName?.trim() || 'Untitled'}
                  </p>
                  {selectedNodeId && (
                    <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-400 truncate">
                      Selected: {selectedNodeLabel || selectedNodeId}
                    </p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="shrink-0 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Quick actions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map(({ label, prompt: p }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleQuickAction(p)}
                        disabled={loading || (p.includes('this') && !selectedNodeId)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input + Send */}
                <div className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-600">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="e.g. explain workflow, add http after this node…"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 resize-none"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !prompt.trim()}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden />
                    )}
                    {loading ? 'Running…' : 'Send'}
                  </button>
                </div>

                {/* Result / summary */}
                {error && (
                  <div className="shrink-0 border-t border-red-100 px-4 py-3 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30">
                    {result.type === 'explain' && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Explanation
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {result.summary}
                        </p>
                      </div>
                    )}
                    {result.type === 'missing_fields' && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500">
                          What still needs manual input
                        </p>
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {result.missingFields.map((m, i) => (
                            <li key={i}>
                              <strong>{m.nodeLabel ?? m.nodeId}</strong>: {m.field}
                              {m.hint ? ` — ${m.hint}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.type === 'apply_operations' && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                          What would change
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                          {result.summary}
                        </p>
                        {pendingOps && pendingOps.length > 0 ? (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={applyPending}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              onClick={cancelPending}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            No operations to apply. Save the workflow to persist any prior changes.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-600">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Recent commands
                    </p>
                    <ul className="mt-2 space-y-1">
                      {history.slice(0, 4).map((h, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => runCommand(h.prompt)}
                            disabled={loading}
                            className="text-left text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 truncate block w-full rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            {h.prompt.slice(0, 50)}{h.prompt.length > 50 ? '…' : ''}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
