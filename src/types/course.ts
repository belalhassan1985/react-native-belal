// Course Types - aligned with swagger.json
export interface Course {
  id: number;
  name: string;
  course_goal: string;
  course_conditions?: string;
  duration_in_days?: number;
  course_visibility?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  course_status?: 'pending' | 'approved' | 'expired';
  trainees_count?: number;
  beneficiaries?: string;
  courses_category_id: number;
  category_name?: string;
  training_center_id: number;
  training_center_name?: string;
  max_trainees?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseLecture {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseLesson {
  id: number;
  lecture_id: number;
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes?: number;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseDetail {
  course: Course;
  lectures: CourseLecture[];
  lessons: CourseLesson[];
}

export interface CoursesCategory {
  id: number;
  name: string;
  description?: string;
}

// Progress Types - aligned with swagger.json
export interface CourseProgress {
  course_id: number;
  course_name: string;
  progress_percentage: number;
  total_lectures: number;
  completed_lectures: number;
  lectures: LectureProgress[];
}

export interface LectureProgress {
  lecture_id: number;
  lecture_name: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  lessons: LessonProgress[];
}

export interface LessonProgress {
  lesson_id: number;
  lesson_name: string;
  watched_seconds?: number;
  last_position?: number;
  is_completed: boolean;
  progress_percentage?: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
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

// Join Request Types - moved to index.ts
// export interface JoinRequest {
//   id: number;
//   course_id: number;
//   course_title: string;
//   course_image_url?: string;
//   training_center_name?: string;
//   status: 'pending' | 'accepted' | 'rejected';
//   requested_at: string;
//   updated_at?: string;
// }