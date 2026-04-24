import {
  ApiResponse,
  Course,
  CourseLecture,
  CourseLesson,
  CourseProgress,
  CoursesCategory,
  PaginatedResponse,
  TraineeCourse,
} from '../types';
import { apiClient } from '../utils/apiClient';

export interface CourseQueryParams {
  page?: number;
  pageItemsCount?: number;
  search?: string;
  minified?: boolean;
  isPending?: boolean;
  courses_category_id?: number;
  training_center_id?: number;
}

export interface CourseWithContent {
  course: Course;
  lectures: CourseLecture[];
  lessons: CourseLesson[];
}

export interface CourseListResponse {
  status: 'success' | 'error';
  data: {
    items: Course[];
    total: number;
    page: number;
    pageItemsCount: number;
  };
}

export const courseService = {
  /**
   * Get all courses with pagination and filters
   * GET /course/get-all-courses
   */
  async getAllCourses(params?: CourseQueryParams): Promise<CourseListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageItemsCount) queryParams.append('pageItemsCount', String(params.pageItemsCount));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minified !== undefined) queryParams.append('minified', String(params.minified));
    if (params?.isPending !== undefined) queryParams.append('isPending', String(params.isPending));
    if (params?.courses_category_id) queryParams.append('courses_category_id', String(params.courses_category_id));
    if (params?.training_center_id) queryParams.append('training_center_id', String(params.training_center_id));

    const queryString = queryParams.toString();
    const endpoint = `/course/get-all-courses${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CourseListResponse>(endpoint);
  },

  /**
   * Get single course by ID
   * GET /course/get-course
   */
  async getCourse(id: number): Promise<ApiResponse<Course>> {
    const courseId = Number(id);
    return apiClient.get<ApiResponse<Course>>(`/course/get-course?id=${courseId}`);
  },

  /**
   * Get course with all lectures and lessons
   * GET /course/get-course-lectures-and-lessons
   */
  async getCourseLecturesAndLessons(courseId: number): Promise<ApiResponse<CourseWithContent>> {
    const cid = Number(courseId);
    return apiClient.get<ApiResponse<CourseWithContent>>(
      `/course/get-course-lectures-and-lessons?id=${cid}`
    );
  },

  /**
   * Get training centers for a specific course
   * GET /course/get-training-centers-by-course
   */
  async getTrainingCentersByCourse(courseId: number): Promise<ApiResponse<{ id: number; name: string }[]>> {
    return apiClient.get<ApiResponse<{ id: number; name: string }[]>>(
      `/course/get-training-centers-by-course?id=${courseId}`
    );
  },

  /**
   * Get all lectures for a course
   * GET /course-lecture/get-all-lectures-by-course
   */
  async getLecturesByCourseId(courseId: number): Promise<ApiResponse<CourseLecture[]>> {
    return apiClient.get<ApiResponse<CourseLecture[]>>(
      `/course-lecture/get-all-lectures-by-course?course_id=${courseId}`
    );
  },

  /**
   * Get single lecture
   * GET /course-lecture/get-lecture
   */
  async getLecture(id: number): Promise<ApiResponse<CourseLecture>> {
    return apiClient.get<ApiResponse<CourseLecture>>(`/course-lecture/get-lecture?id=${id}`);
  },

  /**
   * Get single lesson
   * GET /course-lesson/get-lesson
   */
  async getLesson(id: number): Promise<ApiResponse<CourseLesson>> {
    return apiClient.get<ApiResponse<CourseLesson>>(`/course-lesson/get-lesson?id=${id}`);
  },

  /**
   * Get all course categories
   * GET /courses-category/get-all-courses-categories
   */
  async getAllCategories(): Promise<ApiResponse<CoursesCategory[]>> {
    return apiClient.get<ApiResponse<CoursesCategory[]>>('/courses-category/get-all-courses-categories');
  },

  /**
   * Get courses ending soon
   * GET /course/get-courses-ending-soon
   */
  async getCoursesEndingSoon(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<ApiResponse<Course[]>>('/course/get-courses-ending-soon');
  },

  /**
   * Get trainee's enrolled courses with progress
   * GET /lesson-progress/my-courses
   */
  async getMyCourses(): Promise<ApiResponse<TraineeCourse[]>> {
    return apiClient.get<ApiResponse<TraineeCourse[]>>('/lesson-progress/my-courses');
  },

  /**
   * Get course progress for enrolled course
   * GET /lesson-progress/course/{courseId}
   */
  async getCourseProgress(courseId: number): Promise<ApiResponse<CourseProgress>> {
    return apiClient.get<ApiResponse<CourseProgress>>(`/lesson-progress/course/${courseId}`);
  },
};