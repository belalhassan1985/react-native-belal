export interface Course {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  training_center_id: number;
  training_center_name?: string;
  start_date: string;
  end_date: string;
  max_trainees: number;
  status: 'pending' | 'approved' | 'expired';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseLecture {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  created_at: string;
}

export interface CourseLesson {
  id: number;
  lecture_id: number;
  title: string;
  description: string;
  video_url?: string;
  duration_minutes: number;
  order: number;
  created_at: string;
}

export interface CoursesCategory {
  id: number;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
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

export interface CourseDetail {
  course: Course;
  lectures: CourseLecture[];
  lessons: CourseLesson[];
}

export interface JoinRequest {
  id: number;
  course_id: number;
  course_title: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_at: string;
}