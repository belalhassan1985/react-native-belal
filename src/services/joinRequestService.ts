import { apiClient } from '../utils/apiClient';
import {
  JoinRequest,
  JoinRequestResponse,
  JoinRequestStatusResponse,
  CreateJoinRequestResponse,
  CourseJoinStatus,
} from '../types';

export const joinRequestService = {
  /**
   * Get all join requests for the current trainee
   * GET /course-join-request/get-my-join-requests
   */
  async getMyRequests(): Promise<JoinRequestResponse> {
    return apiClient.get<JoinRequestResponse>('/course-join-request/get-my-join-requests');
  },

  /**
   * Get join request status for a specific course
   * GET /course-join-request/get-course-join-status?course_id=
   */
  async getCourseStatus(courseId: number): Promise<JoinRequestStatusResponse> {
    return apiClient.get<JoinRequestStatusResponse>(
      `/course-join-request/get-course-join-status?course_id=${courseId}`
    );
  },

  /**
   * Create a new join request for a course
   * POST /course-join-request/create-course-join-request
   */
  async createRequest(courseId: number): Promise<CreateJoinRequestResponse> {
    return apiClient.post<CreateJoinRequestResponse>(
      '/course-join-request/create-course-join-request',
      { course_id: courseId }
    );
  },

  /**
   * Extract CourseJoinStatus from response
   */
  parseCourseStatus(response: JoinRequestStatusResponse): CourseJoinStatus {
    return response.data ?? { has_request: false };
  },

  /**
   * Get pending requests only
   */
  filterPending(requests: JoinRequest[]): JoinRequest[] {
    return requests.filter(r => r.status === 'pending');
  },

  /**
   * Get accepted requests only
   */
  filterAccepted(requests: JoinRequest[]): JoinRequest[] {
    return requests.filter(r => r.status === 'accepted');
  },

  /**
   * Get rejected requests only
   */
  filterRejected(requests: JoinRequest[]): JoinRequest[] {
    return requests.filter(r => r.status === 'rejected');
  },
};