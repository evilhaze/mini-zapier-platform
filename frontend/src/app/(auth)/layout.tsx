import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="shrink-0 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-slate-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-xs font-semibold text-white">
              Z
            </span>
            <span className="text-sm tracking-tight">Zyper</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
