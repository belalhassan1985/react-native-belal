import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../utils/apiClient';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { userService } from '../services/userService';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await authService.isAuthenticated();
      setIsAuthenticated(auth);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    setIsAuthenticated(true);
    userService.clearCache();
    router.replace('/(tabs)/home');
  };

  const logout = useCallback(async () => {
    console.log('Logout: 1. setIsAuthenticated(false)');
    setIsAuthenticated(false);

    console.log('Logout: 2. clearCache()');
    userService.clearCache();

    console.log('Logout: 3. clearAuth()');
    await storage.clearAuth();

    console.log('Logout: 4. API post /auth/logout');
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.log('Logout: API failed (ignored):', e);
    }

    console.log('Logout: 5. router.replace(/login)');
    await router.replace('/login');

    console.log('Logout: DONE');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}