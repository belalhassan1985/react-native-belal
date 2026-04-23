import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { courseService } from '../../src/services/courseService';
import { CourseProgress, Course } from '../../src/types';
import { ModernCourseCard } from '../../src/components/ModernCourseCard';
import { StatsCard } from '../../src/components/StatsCard';
import { AvailableCourseCard } from '../../src/components/AvailableCourseCard';
import { EmptyState, Loading } from '../../src/components';
import { SPACING } from '../../src/constants';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [myCourses, setMyCourses] = useState<CourseProgress[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setError(null);
      const [myCoursesData, availableCoursesData] = await Promise.all([
        courseService.getMyCourses(),
        courseService.getAllCourses({ page: 1, pageItemsCount: 10 })
      ]);
      
      console.log('[Home] My Courses:', myCoursesData);
      console.log('[Home] Available Courses:', availableCoursesData);
      
      const coursesArray = Array.isArray(myCoursesData) ? myCoursesData : [];
      setMyCourses(coursesArray);
      
      let availableArray: Course[] = [];
      if (availableCoursesData?.data?.items) {
        availableArray = availableCoursesData.data.items;
      } else if (availableCoursesData?.data && Array.isArray(availableCoursesData.data)) {
        availableArray = availableCoursesData.data;
      } else if (Array.isArray(availableCoursesData)) {
        availableArray = availableCoursesData;
      }
      
      setAvailableCourses(availableArray);
    } catch (err: any) {
      console.error('[Home] Error:', err);
      setError(err.message || 'فشل تحميل البيانات');
      setMyCourses([]);
      setAvailableCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const onCoursePress = (courseId: number) => {
    router.push(`/course/${courseId}` as any);
  };

  const activeCourses = myCourses.filter(c => c.progress_percentage < 100);
  const completedCourses = myCourses.filter(c => c.progress_percentage === 100);
  const totalLectures = myCourses.reduce((sum, c) => sum + c.total_lectures, 0);
  const completedLectures = myCourses.reduce((sum, c) => sum + c.completed_lectures, 0);
  const avgProgress = myCourses.length > 0 
    ? Math.round(myCourses.reduce((sum, c) => sum + c.progress_percentage, 0) / myCourses.length)
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <EmptyState
          title="حدث خطأ"
          message={error}
          icon="⚠️"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <LinearGradient
          colors={['#EEF2FF', '#F8FAFC'] as const}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>مرحباً بك 👋</Text>
            <Text style={styles.subtitle}>استمر في رحلتك التعليمية</Text>
          </View>
        </LinearGradient>

        {myCourses.length > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="الدورات النشطة"
                  value={activeCourses.length}
                  subtitle="قيد التقدم"
                  icon="🎯"
                  gradientColors={['#3B82F6', '#2563EB'] as const}
                />
              </View>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="الدورات المكتملة"
                  value={completedCourses.length}
                  subtitle="تم الإنجاز"
                  icon="✅"
                  gradientColors={['#10B981', '#059669'] as const}
                />
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="متوسط التقدم"
                  value={`${avgProgress}%`}
                  subtitle="إجمالي"
                  icon="📊"
                  gradientColors={['#F59E0B', '#D97706'] as const}
                />
              </View>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="المحاضرات"
                  value={`${completedLectures}/${totalLectures}`}
                  subtitle="مكتملة"
                  icon="📚"
                  gradientColors={['#8B5CF6', '#7C3AED'] as const}
                />
              </View>
            </View>
          </View>
        )}

        {activeCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الدورات النشطة</Text>
              <Text style={styles.sectionSubtitle}>أكمل تدريبك الحالي</Text>
            </View>
            {activeCourses.map((course) => (
              <ModernCourseCard
                key={course.course_id}
                course={course}
                onPress={() => onCoursePress(course.course_id)}
              />
            ))}
          </View>
        )}

        {completedCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الدورات المكتملة</Text>
              <Text style={styles.sectionSubtitle}>إنجازاتك</Text>
            </View>
            {completedCourses.map((course) => (
              <ModernCourseCard
                key={course.course_id}
                course={course}
                onPress={() => onCoursePress(course.course_id)}
              />
            ))}
          </View>
        )}

        {availableCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الدورات المتاحة</Text>
              <Text style={styles.sectionSubtitle}>استكشف دورات جديدة</Text>
            </View>
            {availableCourses.slice(0, 5).map((course) => (
              <AvailableCourseCard
                key={course.id}
                course={course}
              />
            ))}
          </View>
        )}

        {myCourses.length === 0 && availableCourses.length === 0 && (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="لا توجد دورات"
              message="لا توجد دورات متاحة حالياً"
              icon="📚"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 24,
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCardWrapper: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  emptyContainer: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
});
