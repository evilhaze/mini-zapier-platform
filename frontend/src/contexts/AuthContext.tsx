'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_DEMO = 'zyper_demo';
const STORAGE_USER = 'zyper_user';

type User = { email: string };

type AuthContextValue = {
  isDemo: boolean;
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  tryDemo: () => void;
  logout: () => void;
  hydrated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemo(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_DEMO) === 'true';
}

function readUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    return data?.email ? data : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsDemo(readDemo());
    setUser(readUser());
    setIsLoggedIn(!!readUser());
    setHydrated(true);
  }, []);

  const tryDemo = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_USER);
    window.localStorage.setItem(STORAGE_DEMO, 'true');
    setIsLoggedIn(false);
    setUser(null);
    setIsDemo(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!email.trim()) throw new Error('Email is required');
      if (!password.trim()) throw new Error('Password is required');
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(STORAGE_DEMO);
      const u = { email: email.trim() };
      window.localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      setUser(u);
      setIsLoggedIn(true);
      setIsDemo(false);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      if (!email.trim()) throw new Error('Email is required');
      if (!password.trim()) throw new Error('Password is required');
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(STORAGE_DEMO);
      const u = { email: email.trim() };
      window.localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      setUser(u);
      setIsLoggedIn(true);
      setIsDemo(false);
    },
    []
  );

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_USER);
    window.localStorage.removeItem(STORAGE_DEMO);
    setUser(null);
    setIsLoggedIn(false);
    setIsDemo(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isDemo,
      isLoggedIn,
      user,
      login,
      signup,
      tryDemo,
      logout,
      hydrated,
    }),
    [isDemo, isLoggedIn, user, login, signup, tryDemo, logout, hydrated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
