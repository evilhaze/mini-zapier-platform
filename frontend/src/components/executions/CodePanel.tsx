'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Props = {
  title: string;
  content: string;
  /** Optional language for future syntax highlight */
  language?: string;
  defaultOpen?: boolean;
};

export function CodePanel({
  title,
  content,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-900/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <span className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          )}
          {title}
        </span>
      </button>
      {open && (
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-800 max-h-[320px] overflow-y-auto">
          <code>{content}</code>
        </pre>
      )}
    </div>
  );
}
