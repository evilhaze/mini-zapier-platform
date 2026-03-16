'use client';

import Link from 'next/link';
import { Menu, Plus } from 'lucide-react';

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header
      className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 md:px-6"
      role="banner"
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="rounded-btn p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 text-center text-sm text-slate-500 md:text-left">
        Design, run and monitor automations with Zyper.
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/workflows?create=1"
          className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          Create workflow
        </Link>
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-500 hover:text-accent transition-colors"
        >
          API Docs
        </a>
        <span className="w-9 md:hidden" aria-hidden />
      </div>
    </header>
  );
}
