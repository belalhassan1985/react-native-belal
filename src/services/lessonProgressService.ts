import { apiClient } from '../utils/apiClient';
import {
  TraineeCourse,
  LectureProgress,
  LessonProgress,
  ProgressUpdate,
  ApiResponse,
} from '../types';

export const lessonProgressService = {
  async getMyCourses(): Promise<ApiResponse<TraineeCourse[]>> {
    return apiClient.get<ApiResponse<TraineeCourse[]>>('/lesson-progress/my-courses');
  },

  async getCourseProgress(courseId: number): Promise<ApiResponse<{
    course: TraineeCourse;
    lectures: LectureProgress[];
    lessons: LessonProgress[];
  }>> {
    return apiClient.get<ApiResponse<{
    course: TraineeCourse;
    lectures: LectureProgress[];
    lessons: LessonProgress[];
    progress_percentage: number;
  }>>(`/lesson-progress/course/${courseId}`);
  },

  async getLectureProgress(lectureId: number): Promise<ApiResponse<LectureProgress>> {
    return apiClient.get<ApiResponse<LectureProgress>>(`/lesson-progress/lecture/${lectureId}`);
  },

  async getLessonProgress(lessonId: number): Promise<ApiResponse<LessonProgress>> {
    return apiClient.get<ApiResponse<LessonProgress>>(`/lesson-progress/lesson/${lessonId}`);
  },

  async updateProgress(updates: ProgressUpdate[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/lesson-progress/update', { updates });
  },
};