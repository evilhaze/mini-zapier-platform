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

export type User = {
  email: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null; // ISO
  status?: 'active' | 'demo' | 'unknown';
};

type AuthContextValue = {
  isDemo: boolean;
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile?: Pick<User, 'name' | 'username'>) => Promise<void>;
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
    if (!data?.email) return null;
    return {
      email: String(data.email),
      name: typeof data.name === 'string' ? data.name : null,
      username: typeof data.username === 'string' ? data.username : null,
      avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : null,
      status:
        data.status === 'active' || data.status === 'demo' || data.status === 'unknown'
          ? data.status
          : 'unknown',
    };
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
      const existing = readUser();
      const nowIso = new Date().toISOString();
      const cleanEmail = email.trim();
      const inferredName = cleanEmail.split('@')[0]?.replace(/[._-]+/g, ' ') ?? cleanEmail;
      const u: User =
        existing?.email?.toLowerCase() === cleanEmail.toLowerCase()
          ? {
              ...existing,
              email: cleanEmail,
              status: 'active',
              createdAt: existing.createdAt ?? nowIso,
              name: existing.name ?? inferredName,
              username: existing.username ?? cleanEmail.split('@')[0] ?? null,
            }
          : {
              email: cleanEmail,
              name: inferredName,
              username: cleanEmail.split('@')[0] ?? null,
              createdAt: nowIso,
              status: 'active',
            };
      window.localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      setUser(u);
      setIsLoggedIn(true);
      setIsDemo(false);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, profile?: Pick<User, 'name' | 'username'>) => {
      if (!email.trim()) throw new Error('Email is required');
      if (!password.trim()) throw new Error('Password is required');
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(STORAGE_DEMO);
      const nowIso = new Date().toISOString();
      const cleanEmail = email.trim();
      const inferredName = cleanEmail.split('@')[0]?.replace(/[._-]+/g, ' ') ?? cleanEmail;
      const name = profile?.name?.trim() || inferredName;
      const username = profile?.username?.trim() || (cleanEmail.split('@')[0] ?? null);
      const u: User = {
        email: cleanEmail,
        name,
        username,
        createdAt: nowIso,
        status: 'active',
      };
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
