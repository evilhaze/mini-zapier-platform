'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  ListChecks,
  PenSquare,
  Zap,
  Plus,
  X,
} from 'lucide-react';

const nav = [
  { href: '/home', label: 'Home', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/executions', label: 'Executions', icon: ListChecks },
  { href: '/editor', label: 'Editor', icon: PenSquare },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop (mobile only) */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-w)] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-soft transition-transform duration-200 ease-out
          md:relative md:translate-x-0 md:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo row */}
        <div className="flex h-[var(--topbar-h)] items-center justify-between border-b border-slate-200/80 px-4 md:px-5">
          <Link
            href="/home"
            className="flex items-center gap-2.5 font-semibold text-slate-900"
            onClick={() => onClose()}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Zyper
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-auto p-4" aria-label="Sidebar">
          <Link
            href="/workflows?create=1"
            onClick={() => onClose()}
            className="mb-1 inline-flex items-center justify-center gap-2 rounded-btn border border-red-600 bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Create workflow
          </Link>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 px-1">
            Navigation
          </div>
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/home'
                ? pathname === '/home'
                : href === '/editor'
                  ? pathname?.startsWith('/editor') ?? false
                  : (pathname?.startsWith(href) ?? false);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onClose()}
                className={`
                  flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
