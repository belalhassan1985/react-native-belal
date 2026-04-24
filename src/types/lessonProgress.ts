// Lesson Progress Types - aligned with swagger.json

export interface TraineeCourse {
  id: number;
  course_id: number;
  course_title: string;
  course_description?: string;
  course_image_url?: string;
  training_center_name?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'pending';
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  joined_at?: string;
}

// Individual lesson progress from /lesson-progress/lesson/{lessonId}
export interface TraineeLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  lesson_name?: string;
  watched_seconds: number;
  last_position: number;
  is_completed: boolean;
  progress_percentage: number;
  video_duration?: number;
  page_duration_number?: number;
  created_at?: string;
  updated_at?: string;
}

// Individual lecture progress from /lesson-progress/lecture/{lectureId}
export interface TraineeLectureProgress {
  lecture_id: number;
  lecture_name: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  lessons: TraineeLessonProgress[];
}

// Full course progress from /lesson-progress/course/{courseId} and /lesson-progress/my-courses
export interface TraineeCourseProgress {
  course_id: number;
  course_name: string;
  progress_percentage: number;
  total_lectures: number;
  completed_lectures: number;
  lectures: TraineeLectureProgress[];
}

// Request body for updating lesson progress
export interface ProgressUpdateRequest {
  lesson_id: number;
  watched_seconds?: number;
  last_position?: number;
  is_completed?: boolean;
  video_duration?: number;
  page_duration_number?: number;
}

// Course status enum
export type CourseStatus = 'pending' | 'approved' | 'expired';

// Enrollment status enum
export type EnrollmentStatus = 'pending' | 'accepted' | 'rejected';