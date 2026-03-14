'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  ListChecks,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/executions', label: 'Executions', icon: ListChecks },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-[var(--sidebar-w)] shrink-0 border-r border-slate-200 bg-white"
      aria-label="Main navigation"
    >
      <div className="flex h-[var(--topbar-h)] items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
          <PlayCircle className="h-6 w-6 text-accent" aria-hidden />
          <span>Automation</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 p-3" aria-label="Sidebar">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : (pathname?.startsWith(href) ?? false);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent-dark'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
