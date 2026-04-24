import { apiClient } from '../utils/apiClient';
import { UserProfile, ProfileResponse, ApiResponse } from '../types';

const profileCache = {
  data: null as UserProfile | null,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutes
};

export interface UpdateProfileData {
  nickname?: string;
}

export const userService = {
  /**
   * Get profile with caching
   * Returns cached data if still valid
   */
  async getProfile(forceRefresh = false): Promise<UserProfile> {
    const now = Date.now();
    const isCacheValid =
      profileCache.data !== null &&
      (now - profileCache.timestamp) < profileCache.TTL;

    if (!forceRefresh && isCacheValid && profileCache.data) {
      return profileCache.data;
    }

    const response = await apiClient.get<ProfileResponse>('/auth/get-profile');
    profileCache.data = response.data;
    profileCache.timestamp = now;

    return response.data;
  },

  /**
   * Get cached profile without API call
   */
  getCachedProfile(): UserProfile | null {
    return profileCache.data;
  },

  /**
   * Clear profile cache
   */
  clearCache(): void {
    profileCache.data = null;
    profileCache.timestamp = 0;
  },

  /**
   * Update profile
   * PUT /trainee/update-trainee
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.put<ApiResponse<UserProfile>>(
      '/trainee/update-trainee',
      data
    );

    if (response.status === 'success' && response.data) {
      profileCache.data = response.data;
      profileCache.timestamp = Date.now();
    }

    return response;
  },
};