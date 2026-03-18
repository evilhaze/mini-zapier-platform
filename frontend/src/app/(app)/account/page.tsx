'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Plus, Shield, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CopyButton } from '@/components/ui/CopyButton';

type ApiKey = {
  id: string;
  label: string;
  createdAt: string; // ISO
  value: string; // stored for demo; displayed masked
};

const storageKeyFor = (email: string) => `zyper_api_keys:${email.toLowerCase()}`;

function safeParseKeys(raw: string | null): ApiKey[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as ApiKey[];
    if (!Array.isArray(data)) return [];
    return data.filter((k) => k && typeof k.id === 'string' && typeof k.value === 'string');
  } catch {
    return [];
  }
}

function maskKey(value: string) {
  const clean = value.trim();
  if (clean.length <= 10) return '••••••••••';
  return `${clean.slice(0, 4)}••••••••••${clean.slice(-4)}`;
}

function daysAgo(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function base64Url(bytes: Uint8Array) {
  const s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function generateApiKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `zyper_${base64Url(bytes)}`;
}

export default function AccountPage() {
  const { hydrated, isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const email = user?.email ?? '';
  const createdAt = user?.createdAt ?? null;

  const keys = useMemo(() => {
    if (!email || typeof window === 'undefined') return [];
    return safeParseKeys(window.localStorage.getItem(storageKeyFor(email)));
  }, [email, newKey]);

  const memberDays = daysAgo(createdAt);
  const memberText =
    memberDays == null
      ? '—'
      : memberDays === 0
        ? 'Registered today'
        : `Registered ${memberDays} day${memberDays === 1 ? '' : 's'} ago`;

  const displayName = (user?.name?.trim() || user?.username?.trim() || email.split('@')[0] || 'Untitled user').trim();
  const initial = (displayName[0] ?? 'U').toUpperCase();

  const handleCreateKey = async () => {
    if (!email || typeof window === 'undefined') return;
    setCreating(true);
    try {
      const value = generateApiKey();
      const item: ApiKey = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        label: `API key ${keys.length + 1}`,
        createdAt: new Date().toISOString(),
        value,
      };
      const next = [item, ...keys];
      window.localStorage.setItem(storageKeyFor(email), JSON.stringify(next));
      setNewKey(value);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (id: string) => {
    if (!email || typeof window === 'undefined') return;
    const next = keys.filter((k) => k.id !== id);
    window.localStorage.setItem(storageKeyFor(email), JSON.stringify(next));
    setNewKey((v) => v); // trigger refresh
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl border border-slate-200/80 bg-white" />
        <div className="h-48 rounded-2xl border border-slate-200/80 bg-white" />
      </div>
    );
  }

  if (!isLoggedIn) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 text-xl font-semibold text-slate-800 ring-1 ring-black/5">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Account</p>
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">{displayName}</h1>
                <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                  {user?.username ? <div className="truncate">@{user.username}</div> : null}
                  <div className="truncate">{email}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                    <Shield className="h-3.5 w-3.5" />
                    Status: {user?.status ?? 'unknown'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {memberText}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                    Member since {formatDate(createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-btn border border-slate-200/80 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">API keys</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Keys for API access</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Keys are shown only once at creation in real products. In this MVP we store them locally for demo purposes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateKey}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Create API key
          </button>
        </div>

        {newKey ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold text-emerald-900">New API key</div>
            <div className="mt-1 text-xs text-emerald-800">
              Copy it now. You won&apos;t see it unmasked again.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-white/70 px-3 py-2 text-xs text-emerald-900 ring-1 ring-emerald-200">
                {newKey}
              </code>
              <CopyButton
                value={newKey}
                label="Copy"
                copiedLabel="Copied"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/40"
              />
              <button
                type="button"
                onClick={() => setNewKey(null)}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/40"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          {keys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">No API keys yet</div>
              <div className="mt-1 text-sm text-slate-600">
                Create a key to authenticate API requests.
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Created</div>
                <div className="col-span-3">Key</div>
                <div className="col-span-1 text-right"> </div>
              </div>
              <div className="divide-y divide-slate-200/80 bg-white">
                {keys.map((k) => (
                  <div key={k.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                    <div className="col-span-5 min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{k.label || 'API key'}</div>
                      <div className="truncate text-xs text-slate-500">{k.id}</div>
                    </div>
                    <div className="col-span-3 text-sm text-slate-600">{formatDate(k.createdAt)}</div>
                    <div className="col-span-3">
                      <code className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">
                        {maskKey(k.value)}
                      </code>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRevoke(k.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

