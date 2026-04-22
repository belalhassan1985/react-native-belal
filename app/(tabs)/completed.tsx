import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lessonProgressService } from '../../src/services/lessonProgressService';
import { TraineeCourse } from '../../src/types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants';

export default function CompletedScreen() {
  const [completedCourses, setCompletedCourses] = useState<TraineeCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompleted = useCallback(async () => {
    setError(null);
    try {
      const res = await lessonProgressService.getMyCourses();
      if (res.status === 'success' && Array.isArray(res.data)) {
        const completed = res.data.filter(c => c.status === 'completed');
        setCompletedCourses(Array.isArray(completed) ? completed : []);
      } else {
        setCompletedCourses([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setCompletedCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompleted();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🎓</Text>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.retryButton}>
            <Text style={styles.retryText} onPress={fetchCompleted}>إعادة المحاولة</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (completedCourses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyTitle}>لا توجد دورات مكتملة</Text>
          <Text style={styles.emptyMessage}>أكمل تدريبك للحصول على الشهادات</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الدورات المكتملة</Text>
          <Text style={styles.headerSubtitle}>
            {completedCourses.length} دورة
          </Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCourses.length}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {completedCourses.reduce((sum, c) => sum + (c.total_lessons || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>درس</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل التدريب</Text>
          {completedCourses.map((course, index) => (
            <CompletedCourseCard key={course.id || index} course={course} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CompletedCourseCard({ course }: { course: TraineeCourse }) {
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.courseCard}>
      {course.course_image_url && (
        <Image
          source={{ uri: course.course_image_url }}
          style={styles.courseImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.courseContent}>
        <View style={styles.courseHeader}>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>مكتمل</Text>
          </View>
          <Text style={styles.courseDate}>{formatDate(course.end_date)}</Text>
        </View>
        <Text style={styles.courseTitle}>{course.course_title || 'بدون عنوان'}</Text>
        {course.training_center_name && (
          <Text style={styles.courseCenter}>{course.training_center_name}</Text>
        )}
        <View style={styles.courseStats}>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>
              {course.completed_lessons}/{course.total_lessons} درس
            </Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>
              {course.progress_percentage}%
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(course.progress_percentage || 0, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    paddingVertical: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.surfaceLight,
  },
  courseContent: {
    padding: SPACING.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  completedBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  courseDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  courseTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  courseCenter: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  courseStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
  },
  retryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});