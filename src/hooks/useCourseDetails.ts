import { useState, useEffect, useCallback } from 'react';
import { courseService, CourseWithContent } from '../services/courseService';
import { Course, CourseLecture, CourseProgress } from '../types';

interface UseCourseDetailsResult {
  course: Course | null;
  lectures: CourseLecture[];
  progress: CourseProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCourseDetails(courseId: number): UseCourseDetailsResult {
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<CourseLecture[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!courseId) {
      setError('معرف الدورة غير صالح');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [progressRes, courseRes, curriculumRes] = await Promise.allSettled([
        courseService.getCourseProgress(courseId).catch(() => null),
        courseService.getCourse(courseId).catch(() => null),
        courseService.getCourseLecturesAndLessons(courseId).catch(() => null),
      ]);

      // Handle progress
      if (progressRes.status === 'fulfilled' && progressRes.value?.data) {
        setProgress(progressRes.value.data);
      }

      // Handle course details
      if (courseRes.status === 'fulfilled' && courseRes.value?.data) {
        setCourse(courseRes.value.data);
      }

      // Handle curriculum (lectures + lessons)
      if (curriculumRes.status === 'fulfilled' && curriculumRes.value?.data) {
        const curriculum = curriculumRes.value.data;
        
        if (curriculum.course) {
          setCourse(prev => prev || curriculum.course);
        }
        
        if (curriculum.lectures && Array.isArray(curriculum.lectures)) {
          setLectures(curriculum.lectures);
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل البيانات';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    course,
    lectures,
    progress,
    isLoading,
    error,
    refetch: loadData,
  };
}