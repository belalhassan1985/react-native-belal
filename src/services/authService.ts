import { apiClient } from '../utils/apiClient';
import { storage } from '../utils/storage';
import { LoginCredentials, LoginResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.status === 'success' && response.data.token) {
      await storage.setToken('access_token', response.data.token);
      await storage.setToken('user_role', response.data.role);
    }
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await storage.clearAuth();
    }
  },

  async getToken(): Promise<string | null> {
    return storage.getToken('access_token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken('access_token');
    return !!token;
  },

  async getRole(): Promise<string | null> {
    return storage.getToken('user_role');
  },
};