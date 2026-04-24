import { apiClient } from '../utils/apiClient';
import {
  TraineeCourse,
  TraineeLectureProgress,
  TraineeLessonProgress,
  TraineeCourseProgress,
  ProgressUpdateRequest,
  ApiResponse,
} from '../types';

export interface MyCoursesResponse {
  status: 'success' | 'error';
  data: TraineeCourse[];
}

export interface LessonProgressResponse {
  status: 'success' | 'error';
  data: TraineeLessonProgress;
}

export interface LectureProgressResponse {
  status: 'success' | 'error';
  data: TraineeLectureProgress;
}

export interface CourseProgressResponse {
  status: 'success' | 'error';
  data: TraineeCourseProgress;
}

export const lessonProgressService = {
  /**
   * Get trainee's enrolled courses with progress
   * GET /lesson-progress/my-courses
   */
  async getMyCourses(): Promise<MyCoursesResponse> {
    const response = await apiClient.get<MyCoursesResponse>('/lesson-progress/my-courses');
    return response;
  },

  /**
   * Get course progress for enrolled course
   * GET /lesson-progress/course/{courseId}
   */
  async getCourseProgress(courseId: number): Promise<CourseProgressResponse> {
    return apiClient.get<CourseProgressResponse>(`/lesson-progress/course/${courseId}`);
  },

  /**
   * Get lecture progress
   * GET /lesson-progress/lecture/{lectureId}
   */
  async getLectureProgress(lectureId: number): Promise<LectureProgressResponse> {
    return apiClient.get<LectureProgressResponse>(`/lesson-progress/lecture/${lectureId}`);
  },

  /**
   * Get lesson progress
   * GET /lesson-progress/lesson/{lessonId}
   */
  async getLessonProgress(lessonId: number): Promise<LessonProgressResponse> {
    return apiClient.get<LessonProgressResponse>(`/lesson-progress/lesson/${lessonId}`);
  },

  /**
   * Update lesson progress
   * POST /lesson-progress/update
   */
  async updateProgress(update: ProgressUpdateRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/lesson-progress/update', update);
  },
};