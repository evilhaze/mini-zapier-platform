import { Link, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, History } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/executions', label: 'Executions', icon: History },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-surface-900">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            FlowForge
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  loc.pathname === to || (to === '/' && loc.pathname === '/')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
