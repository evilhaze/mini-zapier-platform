'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const DEMO_DAYS_TOTAL = 14;
const DEMO_DAYS_LEFT = 14; // mock: could be derived from stored start date
const DEMO_EXECUTIONS_LIMIT = 1000;
const DEMO_EXECUTIONS_USED = 0; // mock: could come from API

export function DemoBanner() {
  const { isDemo } = useAuth();
  if (!isDemo) return null;

  const daysProgress = ((DEMO_DAYS_TOTAL - DEMO_DAYS_LEFT) / DEMO_DAYS_TOTAL) * 100;
  const execProgress = (DEMO_EXECUTIONS_USED / DEMO_EXECUTIONS_LIMIT) * 100;

  return (
    <div className="shrink-0 border-b border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
              Demo mode
            </span>
            <span className="text-xs font-medium text-amber-800">
              {DEMO_DAYS_LEFT} days left
            </span>
          </div>
          <div className="hidden sm:block w-24">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200/80">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${100 - daysProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-900/90">
            <span className="font-medium tabular-nums">{DEMO_EXECUTIONS_USED}</span>
            <span className="text-amber-700/80">/</span>
            <span className="tabular-nums">{DEMO_EXECUTIONS_LIMIT}</span>
            <span className="text-amber-700/80">executions</span>
          </div>
          <div className="hidden md:block w-28">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200/80">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(execProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="rounded-btn border border-amber-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-50"
          >
            Create account
          </Link>
          <Link
            href="/signup"
            className="rounded-btn bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}
