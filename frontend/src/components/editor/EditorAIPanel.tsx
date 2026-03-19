'use client';

import { useState, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, X, Loader2, Send } from 'lucide-react';
import { sendEditorCommand, type EditorCommandResult, type EditorOperation } from '@/lib/ai-api';
import type { DefinitionJson } from './types';

type Props = {
  getDefinition: () => DefinitionJson;
  selectedNodeId: string | null;
  onApplyOperations: (operations: EditorOperation[]) => void;
  onClose?: () => void;
};

export function EditorAIPanel({ getDefinition, selectedNodeId, onApplyOperations, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EditorCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  const handleSubmit = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const def = getDefinition();
      const res = await sendEditorCommand(
        { nodes: def.nodes, edges: def.edges },
        text,
        selectedNodeId
      );
      setResult(res);
      setRecentPrompts((prev) => [text, ...prev.filter((p) => p !== text)].slice(0, 5));
      if (res.type === 'apply_operations' && res.operations.length > 0) {
        onApplyOperations(res.operations);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Command failed');
    } finally {
      setLoading(false);
    }
  }, [prompt, selectedNodeId, getDefinition, onApplyOperations]);

  return (
    <div className="pointer-events-auto flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-soft hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-expanded={open}
        aria-label="AI assistant"
      >
        <Sparkles className="h-4 w-4 text-violet-500" aria-hidden />
        AI
      </button>

      {open && (
        <div className="absolute right-4 top-24 z-40 flex w-[320px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AI Assistant
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {!collapsed && (
            <>
              <div className="p-3 space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Try: &quot;explain&quot;, &quot;missing fields&quot;, &quot;add http after this&quot;
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Explain workflow / Missing fields / Add node…"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {loading ? 'Sending…' : 'Send'}
                </button>
              </div>

              {recentPrompts.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-600">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Recent
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {recentPrompts.slice(0, 3).map((p, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setPrompt(p)}
                          className="text-left text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 truncate block w-full"
                        >
                          {p.slice(0, 40)}{p.length > 40 ? '…' : ''}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="border-t border-red-100 px-4 py-2 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {result && (
                <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-600">
                  {result.type === 'explain' && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Explanation
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {result.summary}
                      </p>
                    </div>
                  )}
                  {result.type === 'missing_fields' && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        Fields to fill
                      </p>
                      <ul className="mt-1 list-inside list-disc text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                        {result.missingFields.map((m, i) => (
                          <li key={i}>
                            {m.nodeLabel ?? m.nodeId}: {m.field}
                            {m.hint ? ` — ${m.hint}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.type === 'apply_operations' && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
                        Applied
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{result.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
