import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, refreshToken, user } = response.data.data;

          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ isAuthenticated: false, user: null });
        }
      },

      updatePassword: async (currentPassword, newPassword) => {
        try {
          await api.put('/auth/password', { currentPassword, newPassword });
          return { success: true };
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to update password' };
        }
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'owner') return true;
        return user.permissions?.[permission] === true;
      },

      hasRole: (...roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;
