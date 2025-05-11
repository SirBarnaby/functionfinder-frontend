import { defineStore } from 'pinia';
import { authService, type User, type AuthResponse } from '../api/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
    isAuthenticated: false
  }),

  actions: {
    /**
     * Set the current user information
     */
    setUser(user: User | null) {
      console.log('Setting user in authStore:', user);
      
      // Make sure the user object has the userId property
      if (user && !user.userId && user.username) {
        console.warn('User object is missing userId, adding username as fallback');
        user.userId = user.username;
      }
      
      this.user = user;
      this.isAuthenticated = !!user;
      
      if (user) {
        // Store in localStorage for persistence across page refreshes
        console.log('Storing user in localStorage with userId:', user.userId);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Double-check what was stored
        const storedUser = localStorage.getItem('user');
        console.log('Verification of stored user:', storedUser);
      } else {
        localStorage.removeItem('user');
      }
    },

    /**
     * Initialize the auth state from localStorage
     */
    initializeAuth() {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson) as User;
          this.setUser(user);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('user');
        }
      }
    },

    /**
     * Login a user
     */
    async login(username: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.login(username, password);
        console.log('Auth response from login:', response);
        
        if (response.success && response.token) {
          const user: User = {
            username: response.username,
            token: response.token,
            userId: response.userId // Include userId from auth response
          };
          this.setUser(user);
          return true;
        } else {
          this.error = response.message || 'Login failed. Please try again.';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || 'Login failed. Please try again.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Register a new user
     */
    async register(username: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.register(username, password);
        console.log('Auth response from register:', response);
        
        if (response.success && response.token) {
          const user: User = {
            username: response.username,
            token: response.token,
            userId: response.userId // Include userId from auth response
          };
          this.setUser(user);
          return true;
        } else {
          this.error = response.message || 'Registration failed. Please try again.';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || 'Registration failed. Please try again.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout the current user
     */
    logout() {
      this.setUser(null);
    }
  },

  getters: {
    /**
     * Check if user is authenticated
     */
    getIsAuthenticated(): boolean {
      return this.isAuthenticated;
    },

    /**
     * Get the current user
     */
    getUser(): User | null {
      return this.user;
    },

    /**
     * Get auth token if available
     */
    getToken(): string | null {
      return this.user?.token || null;
    },

    /**
     * Get username if available
     */
    getUsername(): string | null {
      return this.user?.username || null;
    }
  }
});
