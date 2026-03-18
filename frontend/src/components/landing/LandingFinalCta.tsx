import Link from 'next/link';
import { GitBranch } from 'lucide-react';

export function LandingFinalCta() {
  return (
    <section className="rounded-2xl border border-red-100 bg-[#FEF2F2] px-6 py-6 text-center shadow-sm sm:px-10 sm:py-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
        Create your first workflow today.
      </h2>
      <p className="mt-2 text-sm text-slate-600">Connect a trigger, add actions and watch your first executions appear in Zyper.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          <GitBranch className="h-4 w-4" />
          Try demo
        </Link>
      </div>
    </section>
  );
}

