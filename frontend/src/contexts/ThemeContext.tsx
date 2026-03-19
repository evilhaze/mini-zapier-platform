'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  hydrated: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'zyper_theme';

// In Next.js route groups, there can be multiple mounted ThemeProviders during navigation.
// We keep a small ref-count so we don't remove the `dark` class while another provider is still active.
let mountedProviders = 0;

function readSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readSavedTheme() ?? 'light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Apply Tailwind `dark` class to <html> so global backgrounds (body/html/root wrappers) switch too.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    mountedProviders += 1;
    document.documentElement.classList.toggle('dark', theme === 'dark');

    return () => {
      mountedProviders -= 1;
      if (mountedProviders <= 0) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      hydrated,
      setTheme,
      toggleTheme,
    }),
    [theme, hydrated, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={
          theme === 'dark'
            ? 'min-h-screen bg-slate-950 text-slate-100'
            : 'min-h-screen bg-slate-50 text-slate-900'
        }
        data-theme={theme}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

