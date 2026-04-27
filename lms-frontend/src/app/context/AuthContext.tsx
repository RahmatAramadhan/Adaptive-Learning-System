import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'guru' | 'siswa';
  has_learning_style: boolean;
  learning_style: {
    result: 'visual' | 'auditori' | 'kinestetik';
    visual_percentage: number;
    auditory_percentage: number;
    kinesthetic_percentage: number;
  } | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Verifikasi token saat app pertama kali dibuka
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/me');
        const user = res.data.user as AuthUser;
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const persist = (user: AuthUser, tok: string) => {
    setCurrentUser(user);
    setToken(tok);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    persist(res.data.user, res.data.token);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role = 'siswa'
  ) => {
    const res = await api.post('/register', { name, email, password, password_confirmation, role });
    persist(res.data.user, res.data.token);
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    const res = await api.get('/me');
    const user = res.data.user as AuthUser;
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
