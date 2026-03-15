'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 px-[var(--page-x)] py-[var(--page-y)]">
          <div className="mx-auto max-w-[var(--container-max-w)]">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
