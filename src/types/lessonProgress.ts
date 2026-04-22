export interface TraineeCourse {
  id: number;
  course_id: number;
  course_title: string;
  course_description: string;
  course_image_url?: string;
  training_center_name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'pending';
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  joined_at: string;
}

export interface LectureProgress {
  id: number;
  lecture_id: number;
  lecture_title: string;
  course_id: number;
  is_completed: boolean;
  completed_at?: string;
  updated_at: string;
}

export interface LessonProgress {
  id: number;
  lesson_id: number;
  lesson_title: string;
  lecture_id: number;
  lecture_title: string;
  course_id: number;
  is_completed: boolean;
  completed_at?: string;
  updated_at: string;
}

export interface ProgressUpdate {
  lesson_id: number;
  is_completed: boolean;
}