import { apiClient } from '../utils/apiClient';
import { UserProfile, ProfileResponse } from '../types';

const profileCache = {
  data: null as UserProfile | null,
};

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ProfileResponse>('/auth/get-profile');
    profileCache.data = response.data;
    return response.data;
  },

  clearCache(): void {
    profileCache.data = null;
  },

  getCachedProfile(): UserProfile | null {
    return profileCache.data;
  },
};