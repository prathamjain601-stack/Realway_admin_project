import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isVerified: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem('token'),
  refreshToken: sessionStorage.getItem('refreshToken'),
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  setAuth: (token, refreshToken, user) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ token, refreshToken, user });
  },
  logout: () => {
    // Call API to invalidate session
    api.post('/auth/logout').catch(() => {});
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    set({ token: null, refreshToken: null, user: null });
  },
  updateUser: (userData) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...userData } : null;
      if (updatedUser) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },
}));
