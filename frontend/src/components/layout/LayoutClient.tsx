'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DemoBanner } from './DemoBanner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDemo } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { border: '1px solid var(--tw-slate-200, #e2e8f0)' },
        }}
      />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
          {isDemo && <DemoBanner />}
          <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
          <main className="flex-1 px-[var(--page-x)] py-[var(--page-y)] bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-[var(--container-max-w)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
