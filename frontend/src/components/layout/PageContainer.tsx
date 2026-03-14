import type { ReactNode } from 'react';

/**
 * Optional wrapper for page content when you need extra constraints.
 * Root layout already applies max-w and padding; use this for nested sections.
 */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[var(--container-max-w)]">
      {children}
    </div>
  );
}
