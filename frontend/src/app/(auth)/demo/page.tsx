'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DemoPage() {
  const router = useRouter();
  const { tryDemo, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    tryDemo();
    router.replace('/home');
  }, [hydrated, tryDemo, router]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card">
      <p className="text-sm text-slate-500">Starting demo…</p>
      <p className="mt-2 text-xs text-slate-400">Redirecting to your dashboard.</p>
    </div>
  );
}
