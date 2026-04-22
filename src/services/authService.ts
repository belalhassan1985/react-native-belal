import { apiClient } from '../utils/apiClient';
import { storage } from '../utils/storage';
import { LoginCredentials, LoginResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    if (response.status === 'success' && response.data.token) {
      await storage.setAccessToken(response.data.token);
      await storage.setUserRole(response.data.role);
      console.log('Login: Token stored successfully');
    }
    return response;
  },

  async logout(): Promise<void> {
    console.log('Logout: Starting API logout');
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.log('Logout: API call failed (ignoring):', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getAccessToken();
    return !!token;
  },

  async getRole(): Promise<string | null> {
    return storage.getUserRole();
  },
};