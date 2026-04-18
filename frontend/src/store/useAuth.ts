import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  country?: string;
  language?: string;
  subscription?: { tier: string; expiresAt: number | null } | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('bp24_token', token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('bp24_token');
        set({ token: null, user: null });
      },
    }),
    { name: 'bp24-auth' }
  )
);
