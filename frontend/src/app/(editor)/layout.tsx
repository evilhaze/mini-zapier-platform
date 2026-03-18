'use client';

import { usePathname } from 'next/navigation';
import Link from '@/components/ui/Link';
import { Toaster } from 'sonner';
import { LayoutDashboard, GitBranch, ListChecks, Zap, BarChart3 } from 'lucide-react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Toaster position="top-center" richColors closeButton duration={3000} />
        {/* Compact icon sidebar — z-10 so tooltips render above editor/canvas */}
        <aside className="relative z-10 flex w-14 flex-shrink-0 flex-col items-center gap-4 overflow-visible border-r border-slate-200/80 bg-white py-3 dark:border-slate-800 dark:bg-slate-950">
          <Link
            href="/home"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm ring-1 ring-white/10 transition hover:brightness-110"
            aria-label="Zyper home"
          >
            <Zap className="h-4 w-4" aria-hidden />
          </Link>

          <div className="mt-1">
            <ThemeToggleButton className="border-none bg-transparent p-0 shadow-none hover:bg-transparent" />
          </div>

          <div className="mt-2 flex flex-1 flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400">
            <EditorNavIcon href="/home" label="Home" active={pathname === '/home'}>
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            </EditorNavIcon>
            <EditorNavIcon
              href="/analytics"
              label="Analytics"
              active={(pathname?.startsWith('/analytics') ?? false)}
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
            </EditorNavIcon>
            <EditorNavIcon
              href="/workflows"
              label="Workflows"
              active={(pathname?.startsWith('/workflows') ?? false)}
            >
              <GitBranch className="h-4 w-4" aria-hidden />
            </EditorNavIcon>
            <EditorNavIcon
              href="/executions"
              label="Executions"
              active={(pathname?.startsWith('/executions') ?? false)}
            >
              <ListChecks className="h-4 w-4" aria-hidden />
            </EditorNavIcon>
          </div>
        </aside>

        {/* Editor workspace */}
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">{children}</div>
      </div>
    </ThemeProvider>
  );
}

type EditorNavIconProps = {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
};

function EditorNavIcon({ href, label, active = false, children }: EditorNavIconProps) {
  return (
    <Link
      href={href}
      className={`
        group relative flex h-9 w-9 items-center justify-center rounded-xl border outline-none transition
        ${active
          ? 'border-red-500/30 bg-gradient-to-b from-red-500/20 to-slate-50/80 text-slate-900 shadow-[0_10px_24px_-14px_rgba(239,68,68,0.75)] ring-1 ring-red-500/20 dark:text-slate-50 dark:to-slate-900/40'
          : 'border-transparent bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900 dark:bg-slate-900/55 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900/70 dark:hover:text-slate-50'
        }
        focus-visible:ring-2 focus-visible:ring-red-500
      `}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute -left-[7px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-red-500/80 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
        />
      )}
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 inline-flex -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-slate-700 transition group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

