// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  data: {
    token: string;
    role: string;
  };
}

export interface ProfileState {
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  coordinates: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  first_name: string;
  second_name: string;
  third_name: string;
  fourth_name: string;
  nickname: string;
  gender: 'male' | 'female';
  birth_date: string;
  training_center: string | null;
  state: ProfileState;
  agency: string | null;
  general_department: string | null;
  department: string | null;
  section: string | null;
  image_url: string;
  is_first_login: boolean;
}

export interface ProfileResponse {
  status: 'success' | 'error';
  data: UserProfile;
}

// Generic API Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: {
    items: T[];
    total: number;
    page: number;
    pageItemsCount: number;
  };
}

export interface PaginatedRequest {
  page?: number;
  pageItemsCount?: number;
  search?: string;
}

// Training Center Types
export interface TrainingCenter {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  image_url?: string;
  city?: string;
  state_id?: number;
}

export interface TrainingCenterNote {
  id: number;
  training_center_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  body: string;
  type?: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

export interface NotificationResponse {
  status: 'success' | 'error';
  data: Notification[];
}

export interface UnreadCountResponse {
  status: 'success' | 'error';
  data: {
    count: number;
  };
}

// Join Request Types from joinRequest.ts
export type {
  JoinRequest,
  JoinRequestStatus,
  JoinRequestResponse,
  JoinRequestStatusResponse,
  CreateJoinRequestResponse,
  CourseJoinStatus
} from './joinRequest';

// Trainee Types
export interface Trainee {
  id: number;
  serial_number: string;
  first_name: string;
  second_name: string;
  third_name: string;
  fourth_name: string;
  nickname: string;
  gender: 'male' | 'female';
  birth_date: string;
  degree?: string;
  phone?: string;
  email: string;
  image_url: string;
  training_center_ids: number[];
  employment_type_id?: number;
  employment_rank_id?: number;
  education_degree_id?: number;
  state_id?: number;
  is_first_login: boolean;
}

export interface TraineeResponse {
  status: 'success' | 'error';
  data: Trainee;
}

// Reset Password / First Login Types
export interface ResetPasswordCredentials {
  email: string;
  password: string;
  old_password: string;
  new_password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  status: 'success' | 'error';
  message?: string;
}

// Course Types from course.ts
export type {
  Course,
  CourseLecture,
  CourseLesson,
  CourseDetail,
  CoursesCategory,
  CourseProgress,
  LectureProgress,
  LessonProgress
} from './course';

// Trainee Course/Progress Types from lessonProgress.ts
export type {
  TraineeCourse,
  TraineeLectureProgress,
  TraineeLessonProgress,
  TraineeCourseProgress,
  ProgressUpdateRequest,
  CourseStatus,
  EnrollmentStatus
} from './lessonProgress';