import { useState, useEffect, useCallback } from 'react';
import { lessonProgressService } from '../services/lessonProgressService';
import { courseService } from '../services/courseService';
import { TraineeCourse, Course } from '../types';

interface HomeData {
  activeCourses: TraineeCourse[];
  availableCourses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHomeData(): HomeData {
  const [activeCourses, setActiveCourses] = useState<TraineeCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [progressRes, coursesRes] = await Promise.all([
        lessonProgressService.getMyCourses(),
        courseService.getAllCourses({ pageItemsCount: 20 }),
      ]);

      if (progressRes.status === 'success' && Array.isArray(progressRes.data)) {
        const active = progressRes.data.filter(
          (c: TraineeCourse) => c.status === 'active' || c.status === 'pending'
        );
        setActiveCourses(Array.isArray(active) ? active : []);
      } else {
        setActiveCourses([]);
      }

      if (coursesRes.status === 'success') {
        const items = coursesRes.data?.items ?? coursesRes.data ?? [];
        setAvailableCourses(Array.isArray(items) ? items : []);
      } else {
        setAvailableCourses([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحميل');
      setActiveCourses([]);
      setAvailableCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    activeCourses: activeCourses ?? [],
    availableCourses: availableCourses ?? [],
    isLoading,
    error,
    refetch: fetchData,
  };
}

export function useCourseDetail(courseId: number) {
  const [data, setData] = useState<{
    course: Course | null;
    lectures: any[];
    lessons: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await courseService.getCourseLecturesAndLessons(courseId);
      if (res.status === 'success' && res.data) {
        setData({
          course: res.data.course ?? null,
          lectures: Array.isArray(res.data.lectures) ? res.data.lectures : [],
          lessons: Array.isArray(res.data.lessons) ? res.data.lessons : [],
        });
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحميل');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}