'use client';

import { AlertCircle } from 'lucide-react';

type Props = {
  title: string;
  message: string;
  /** Optional subtitle, e.g. "Step 3: Send HTTP" */
  subtitle?: string;
};

export function ErrorBlock({ title, message, subtitle }: Props) {
  return (
    <div
      className="rounded-card border-2 border-red-200 bg-red-50 p-4 shadow-soft"
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-4 w-4 text-red-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-900">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-sm text-red-700">{subtitle}</p>
          )}
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded border border-red-200 bg-white px-3 py-2 font-mono text-sm text-red-800">
            {message}
          </pre>
        </div>
      </div>
    </div>
  );
}
