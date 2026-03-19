'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import Link from '@/components/ui/Link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggleButton } from './ThemeToggleButton';
import { API_DOCS_URL } from '@/lib/api';

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const apiDocsUrl = API_DOCS_URL;
  const { isLoggedIn, user, logout, hydrated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    const n = user?.name?.trim();
    if (n) return n;
    const u = user?.username?.trim();
    if (u) return u;
    const e = user?.email?.trim();
    if (e) return e.split('@')[0] ?? e;
    return 'Account';
  }, [user?.name, user?.username, user?.email]);

  const initial = useMemo(() => {
    const base = (user?.name || user?.username || user?.email || '').trim();
    const ch = base ? base[0] : 'U';
    return ch.toUpperCase();
  }, [user?.name, user?.username, user?.email]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', onDown, { capture: true });
    return () => window.removeEventListener('mousedown', onDown, { capture: true } as never);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.replace('/login');
  };

  return (
    <header
      className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-4 md:px-6 dark:border-slate-700 dark:bg-slate-900"
      role="banner"
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="rounded-btn p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 text-center text-sm text-slate-500 md:text-left dark:text-slate-300">
        Design, run and monitor automations with Zyper.
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {apiDocsUrl ? (
          <a
            href={apiDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-accent transition-colors dark:text-slate-300"
          >
            API Docs
          </a>
        ) : (
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
            API Docs
          </span>
        )}
        <ThemeToggleButton className="border-none bg-transparent shadow-none dark:border-none dark:bg-transparent" />
        {!hydrated ? (
          <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-slate-900" aria-hidden />
        ) : isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 text-sm font-semibold text-slate-800 ring-1 ring-black/5 dark:from-slate-800 dark:to-slate-900 dark:text-slate-100 dark:ring-white/10">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </span>
              <span className="hidden max-w-[180px] truncate text-sm font-semibold text-slate-700 md:inline">
                {displayName}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 transition group-hover:text-slate-500 md:inline dark:group-hover:text-slate-300 dark:text-slate-500" />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800"
              >
                <div className="flex items-start gap-3 border-b border-slate-200/80 px-4 py-4 dark:border-slate-600">
                  <div className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-base font-semibold text-slate-800 ring-1 ring-black/5 dark:bg-slate-900 dark:text-slate-200 dark:ring-black/20">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
                    {user?.username ? (
                      <div className="truncate text-xs text-slate-500 dark:text-slate-300">@{user.username}</div>
                    ) : null}
                    {user?.email ? <div className="truncate text-xs text-slate-500 dark:text-slate-300">{user.email}</div> : null}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                    role="menuitem"
                  >
                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Open profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-red-700"
            >
              Sign up
            </Link>
          </div>
        )}
        <span className="w-2 md:hidden" aria-hidden />
      </div>
    </header>
  );
}
