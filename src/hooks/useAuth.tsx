import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../utils/apiClient';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { userService } from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  hasSkippedFirstLoginReset: boolean;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  skipFirstLoginReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasSkippedFirstLoginReset, setHasSkippedFirstLoginReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const hasToken = await storage.hasToken();

      if (!hasToken) {
        setIsAuthenticated(false);
        setIsFirstLogin(false);
        setHasSkippedFirstLoginReset(false);
        setProfile(null);
        return;
      }

      const skipped = await storage.isFirstLoginResetSkipped();
      setHasSkippedFirstLoginReset(skipped);

      const profileData = await authService.getProfile();
      setProfile(profileData);
      setIsFirstLogin(profileData.is_first_login);
      setIsAuthenticated(true);
    } catch {
      await storage.clearAuth();
      setIsAuthenticated(false);
      setIsFirstLogin(false);
      setHasSkippedFirstLoginReset(false);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });

    const profileData = await authService.getProfile();
    setProfile(profileData);
    setIsFirstLogin(profileData.is_first_login);

    const skipped = await storage.isFirstLoginResetSkipped();
    setHasSkippedFirstLoginReset(skipped);

    setIsAuthenticated(true);
    userService.clearCache();

    if (profileData.is_first_login && !skipped) {
      router.replace('/reset-password?mode=first-login');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setIsFirstLogin(false);
    setHasSkippedFirstLoginReset(false);
    setProfile(null);
    userService.clearCache();

    await storage.clearAuth();

    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore API errors
    }

    router.replace('/login');
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profileData = await authService.getProfile();
      setProfile(profileData);
    } catch {
      // Ignore errors on refresh
    }
  }, []);

  const skipFirstLoginReset = useCallback(async () => {
    await storage.setFirstLoginResetSkipped(true);
    setHasSkippedFirstLoginReset(true);
    setIsFirstLogin(false);
    await refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        isFirstLogin,
        hasSkippedFirstLoginReset,
        profile,
        login,
        logout,
        refreshProfile,
        skipFirstLoginReset,
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