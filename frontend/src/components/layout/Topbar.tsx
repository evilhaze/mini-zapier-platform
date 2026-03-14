'use client';

export function Topbar() {
  return (
    <header
      className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6"
      role="banner"
    >
      <div className="text-sm text-slate-500">
        Automation Platform — workflows, triggers, executions
      </div>
      <div className="flex items-center gap-4">
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 hover:text-accent"
        >
          API Docs
        </a>
      </div>
    </header>
  );
}
