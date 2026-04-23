import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Loading } from '../../src/components';
import { CompletedCourseCard } from '../../src/components/CompletedCourseCard';
import { StatsCard } from '../../src/components/StatsCard';
import { SPACING } from '../../src/constants';
import { courseService } from '../../src/services/courseService';
import { CourseProgress } from '../../src/types';

export default function CompletedScreen() {
  const [myCourses, setMyCourses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setError(null);
      const courses = await courseService.getMyCourses();
      const coursesArray = Array.isArray(courses) ? courses : [];
      setMyCourses(coursesArray);
    } catch (err: any) {
      console.error('[Completed] Error loading courses:', err);
      setError(err.message || 'فشل تحميل البيانات');
      setMyCourses([]);
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
    router.push(`/course/${courseId}`);
  };

  const completedCourses = myCourses.filter(c => c.progress_percentage === 100);
  const totalLectures = completedCourses.reduce((sum, c) => sum + c.total_lectures, 0);

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
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        <LinearGradient
          colors={['#ECFDF5', '#F8FAFC']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>الدورات المكتملة 🎓</Text>
            <Text style={styles.subtitle}>إنجازاتك التدريبية</Text>
          </View>
        </LinearGradient>

        {completedCourses.length > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="الدورات المكتملة"
                  value={completedCourses.length}
                  subtitle="إنجاز كامل"
                  icon="✅"
                  gradientColors={['#10B981', '#059669']}
                />
              </View>
              <View style={styles.statCardWrapper}>
                <StatsCard
                  title="المحاضرات"
                  value={totalLectures}
                  subtitle="تم إنهاؤها"
                  icon="📚"
                  gradientColors={['#8B5CF6', '#7C3AED']}
                />
              </View>
            </View>
          </View>
        )}

        {completedCourses.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>سجل الإنجازات</Text>
              <Text style={styles.sectionSubtitle}>الدورات التي أكملتها بنجاح</Text>
            </View>
            {completedCourses.map((course) => (
              <CompletedCourseCard
                key={course.course_id}
                course={course}
                onPress={() => onCoursePress(course.course_id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="لا توجد دورات مكتملة"
              message="أكمل دوراتك الحالية للحصول على الشهادات"
              icon="🎓"
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
