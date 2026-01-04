// src/stores/useAuthStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@services/api';
import {
  setToken,
  setUser,
  getToken,
  getUser,
  clearAuth,
  isTokenExpired,
} from '@utils/auth';

export const useAuthStore = create()(
  devtools(
    (set, get) => ({
      // State
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Initialize auth state from localStorage
      initialize: () => {
        const token = getToken();
        const user = getUser();

        if (token && !isTokenExpired(token) && user) {
          set({
            isAuthenticated: true,
            user,
            token,
          });
        } else {
          // Clear invalid/expired auth
          clearAuth();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      },

      // Login action
      login: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
          // Call login API
          const response = await api.auth.login(username, password);
          const { token, username: authUsername } = response;

          // Store in localStorage
          setToken(token);
          setUser({ username: authUsername });

          // Update state
          set({
            isAuthenticated: true,
            user: { username: authUsername },
            token,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error('Login failed:', error);

          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: error.message || 'Login failed',
          });

          return {
            success: false,
            error: error.message || 'Login failed',
          };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout API (optional, JWT is stateless)
          await api.auth.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with logout even if API fails
        }

        // Clear localStorage
        clearAuth();

        // Clear state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check if token is valid
      checkAuth: () => {
        const { token } = get();
        if (!token || isTokenExpired(token)) {
          clearAuth();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-store',
    },
  ),
);
