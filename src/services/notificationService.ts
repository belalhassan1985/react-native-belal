import { apiClient } from '../utils/apiClient';
import { Notification, ApiResponse } from '../types';

export interface NotificationsListResponse {
  status: 'success' | 'error';
  data: Notification[];
}

export interface UnreadResponse {
  status: 'success' | 'error';
  data: {
    count: number;
  };
}

export const notificationService = {
  /**
   * Get all notifications for current user
   * GET /notification/my-notifications
   */
  async getMyNotifications(page = 1, pageItemsCount = 20): Promise<NotificationsListResponse> {
    const response = await apiClient.get<NotificationsListResponse>(
      `/notification/my-notifications?page=${page}&pageItemsCount=${pageItemsCount}`
    );
    return response;
  },

  /**
   * Get unread notifications count
   * GET /notification/unread-count
   */
  async getUnreadCount(): Promise<UnreadResponse> {
    const response = await apiClient.get<UnreadResponse>('/notification/unread-count');
    return response;
  },

  /**
   * Mark single notification as read
   * POST /notification/{id}/mark-as-read
   */
  async markAsRead(id: number): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/notification/${id}/mark-as-read`);
  },

  /**
   * Mark all notifications as read
   * POST /notification/mark-all-as-read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/notification/mark-all-as-read');
  },
};