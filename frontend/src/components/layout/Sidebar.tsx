'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  ListChecks,
  PenSquare,
  PlayCircle,
  X,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold text-slate-900"
            onClick={() => onClose()}
          >
            <PlayCircle className="h-5 w-5 text-accent" aria-hidden />
            <span>Automation</span>
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

        <nav className="flex flex-1 flex-col gap-0.5 overflow-auto p-3" aria-label="Sidebar">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
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
                    ? 'bg-accent/10 text-accent-dark'
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
