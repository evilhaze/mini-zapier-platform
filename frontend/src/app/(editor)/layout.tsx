import Link from 'next/link';
import { LayoutDashboard, GitBranch, ListChecks, PenSquare, Zap } from 'lucide-react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Compact icon sidebar — z-10 so tooltips render above editor/canvas */}
      <aside className="relative z-10 flex w-14 flex-shrink-0 flex-col items-center gap-4 overflow-visible border-r border-slate-800 bg-slate-950 py-4">
        <Link
          href="/home"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm"
          aria-label="Zyper home"
        >
          <Zap className="h-4 w-4" aria-hidden />
        </Link>

        <div className="mt-2 flex flex-1 flex-col items-center gap-3 text-slate-500">
          <EditorNavIcon href="/home" label="Home">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </EditorNavIcon>
          <EditorNavIcon href="/workflows" label="Workflows">
            <GitBranch className="h-4 w-4" aria-hidden />
          </EditorNavIcon>
          <EditorNavIcon href="/executions" label="Executions">
            <ListChecks className="h-4 w-4" aria-hidden />
          </EditorNavIcon>
          <EditorNavIcon href="/editor" label="Editor">
            <PenSquare className="h-4 w-4" aria-hidden />
          </EditorNavIcon>
        </div>
      </aside>

      {/* Editor workspace */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        {children}
      </div>
    </div>
  );
}

type EditorNavIconProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function EditorNavIcon({ href, label, children }: EditorNavIconProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-slate-900/60 text-slate-400 outline-none transition hover:border-slate-600 hover:text-slate-50 focus-visible:ring-2 focus-visible:ring-red-500"
      aria-label={label}
    >
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 inline-flex -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-slate-700 transition group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

