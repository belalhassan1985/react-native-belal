import { apiClient } from '../utils/apiClient';
import {
  Course,
  CourseLecture,
  CourseLesson,
  CoursesCategory,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const courseService = {
  async getAllCourses(params?: {
    page?: number;
    pageItemsCount?: number;
    search?: string;
    category_id?: number;
    training_center_id?: number;
  }): Promise<PaginatedResponse<Course>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageItemsCount) queryParams.append('pageItemsCount', String(params.pageItemsCount));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', String(params.category_id));
    if (params?.training_center_id) queryParams.append('training_center_id', String(params.training_center_id));

    const endpoint = `/course/get-all-courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<Course>>(endpoint);
  },

  async getCourse(id: number): Promise<ApiResponse<Course>> {
    return apiClient.get<ApiResponse<Course>>(`/course/get-course?id=${id}`);
  },

  async getCourseLecturesAndLessons(
    courseId: number
  ): Promise<ApiResponse<{ course: Course; lectures: CourseLecture[]; lessons: CourseLesson[] }>> {
    return apiClient.get<ApiResponse<{ course: Course; lectures: CourseLecture[]; lessons: CourseLesson[] }>>(
      `/course/get-course-lectures-and-lessons?courseId=${courseId}`
    );
  },

  async getAllCategories(): Promise<ApiResponse<CoursesCategory[]>> {
    return apiClient.get<ApiResponse<CoursesCategory[]>>('/courses-category/get-all-courses-categories');
  },

  async getCoursesEndingSoon(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<ApiResponse<Course[]>>('/course/get-courses-ending-soon');
  },
};