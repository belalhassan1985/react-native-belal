import { apiClient } from '../utils/apiClient';
import { storage } from '../utils/storage';
import {
  LoginCredentials,
  LoginResponse,
  ProfileResponse,
  UserProfile,
  ResetPasswordCredentials,
  ResetPasswordResponse,
} from '../types';

export const authService = {
  /**
   * Authenticate user with email and password
   * Stores token and role on success
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
      false // No auth header for login
    );

    if (response.status === 'success' && response.data.token) {
      await storage.setAccessToken(response.data.token);
      await storage.setUserRole(response.data.role);
    }

    return response;
  },

  /**
   * Logout user - calls API and clears local storage
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore API errors, always clear local storage
    } finally {
      await storage.clearAuth();
    }
  },

  /**
   * Check if user has a stored token (not validated)
   */
  async isAuthenticated(): Promise<boolean> {
    return storage.hasToken();
  },

  /**
   * Get stored token (for debugging/logging)
   */
  async getStoredToken(): Promise<string | null> {
    return storage.getAccessToken();
  },

  /**
   * Get user role from storage
   */
  async getRole(): Promise<string | null> {
    return storage.getUserRole();
  },

  /**
   * Fetch user profile from API
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ProfileResponse>('/auth/get-profile');
    return response.data;
  },

  /**
   * Reset first login password
   * Called when user.is_first_login is true
   */
  async resetFirstLogin(credentials: ResetPasswordCredentials): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/reset-first-login',
      credentials
    );
    return response;
  },

  /**
   * Clear all auth storage (logout helper)
   */
  async clearAuth(): Promise<void> {
    await storage.clearAuth();
  },
};