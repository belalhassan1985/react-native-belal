import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_ROLE: 'user_role',
};

const isWeb = Platform.OS === 'web';

export const storage = {
  async setToken(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async getToken(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async removeToken(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },

  async setAccessToken(token: string): Promise<void> {
    await this.setToken(KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken(): Promise<string | null> {
    return this.getToken(KEYS.ACCESS_TOKEN);
  },

  async setUserRole(role: string): Promise<void> {
    await this.setToken(KEYS.USER_ROLE, role);
  },

  async getUserRole(): Promise<string | null> {
    return this.getToken(KEYS.USER_ROLE);
  },

  async clearAuth(): Promise<void> {
    await this.removeToken(KEYS.ACCESS_TOKEN);
    await this.removeToken(KEYS.USER_ROLE);
  },
};