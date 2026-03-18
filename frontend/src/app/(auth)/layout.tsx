import Link from 'next/link';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="shrink-0 border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
          <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-xs font-semibold text-white">
                Z
              </span>
              <span className="text-sm tracking-tight">Zyper</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                Back to home
              </Link>
              <ThemeToggleButton className="border-none bg-transparent shadow-none dark:border-none dark:bg-transparent" />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
