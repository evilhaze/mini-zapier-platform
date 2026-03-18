'use client';

import { useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, hydrated } = useTheme();
  const [animNonce, setAnimNonce] = useState(0);

  const label = useMemo(() => {
    if (!hydrated) return 'Toggle theme';
    return theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  }, [hydrated, theme]);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setAnimNonce((v) => v + 1);
        toggleTheme();
      }}
      className={[
        'group inline-flex items-center justify-center rounded-btn border px-2 py-2',
        'border-slate-200/80 bg-white text-slate-600 shadow-sm',
        'hover:bg-slate-50 hover:text-slate-900',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
        'dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100',
        className,
      ].join(' ')}
    >
      <span className="relative h-5 w-5">
        {/* Icon morph-ish animation: swap + opacity/scale + small rotate. */}
        <Sun
          key={`sun-${animNonce}`}
          className={[
            'absolute inset-0 h-5 w-5 transition-all duration-300 ease-out',
            theme === 'dark' ? 'opacity-0 scale-75 -rotate-12' : 'opacity-100 scale-100 rotate-0',
          ].join(' ')}
          aria-hidden
        />
        <Moon
          key={`moon-${animNonce}`}
          className={[
            'absolute inset-0 h-5 w-5 transition-all duration-300 ease-out',
            theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12',
          ].join(' ')}
          aria-hidden
        />
      </span>
    </button>
  );
}

