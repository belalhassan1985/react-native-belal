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

export interface LessonProgress {
  lesson_id: number;
  lesson_name: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface LectureProgress {
  lecture_id: number;
  lecture_name: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  lessons: LessonProgress[];
}

export interface CourseProgress {
  course_id: number;
  course_name: string;
  progress_percentage: number;
  total_lectures: number;
  completed_lectures: number;
  lectures: LectureProgress[];
}