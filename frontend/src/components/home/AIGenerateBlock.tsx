'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { generateWorkflowDraft, type WorkflowDraft } from '@/lib/ai-api';
import { AIDraftPreviewModal } from './AIDraftPreviewModal';

export function AIGenerateBlock() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const result = await generateWorkflowDraft(text);
      setDraft(result);
      setPreviewOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Generate with AI</h2>
            <p className="text-xs text-slate-500">Describe what you want to automate — we’ll draft a workflow.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="ai-prompt" className="sr-only">
            What would you like to automate?
          </label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. When a webhook is received, save data to DB and send a Telegram alert"
            rows={3}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
            disabled={loading}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate workflow
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </form>
        <p className="mt-3 text-[11px] text-slate-500">
          Uses triggers and actions you have in the editor: webhook, schedule, manual, email, HTTP, Telegram, Database, Transform.
        </p>
      </section>

      <AIDraftPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        draft={draft}
      />
    </>
  );
}
