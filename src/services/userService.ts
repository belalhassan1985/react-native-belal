import { apiClient } from '../utils/apiClient';
import { UserProfile, ProfileResponse } from '../types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ProfileResponse>('/auth/get-profile');
    return response.data;
  },
};