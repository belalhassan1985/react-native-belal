import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../../src/services/courseService';
import { lessonProgressService } from '../../src/services/lessonProgressService';
import { CourseLecture, TraineeLectureProgress } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

export default function LectureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lectureId = Number(id);
  const router = useRouter();

  const [lecture, setLecture] = useState<CourseLecture | null>(null);
  const [progress, setProgress] = useState<TraineeLectureProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLectureData = useCallback(async () => {
    if (!lectureId || lectureId <= 0) {
      setError('معرف المحاضرة غير صالح');
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const [lectureRes, progressRes] = await Promise.allSettled([
        courseService.getLecture(lectureId),
        lessonProgressService.getLectureProgress(lectureId),
      ]);

      if (lectureRes.status === 'fulfilled' && lectureRes.value.status === 'success' && lectureRes.value.data) {
        setLecture(lectureRes.value.data);
      } else {
        setError('لم يتم العثور على المحاضرة');
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.status === 'success' && progressRes.value.data) {
        setProgress(progressRes.value.data);
      }
    } catch {
      setError('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLectureData();
  }, [fetchLectureData]);

  const handleLessonPress = (lessonId: number) => {
    router.push(`/lesson/${lessonId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lecture) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>المحاضرة</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'فشل تحميل البيانات'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLectureData}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = progress?.lessons?.filter(l => l.is_completed).length ?? 0;
  const totalCount = progress?.lessons?.length ?? 0;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المحاضرة</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.lectureTitle}>{lecture.title}</Text>
          {lecture.description && (
            <Text style={styles.lectureDescription}>{lecture.description}</Text>
          )}
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>المحاضرة {lecture.order ?? 1}</Text>
          </View>
        </View>

        {progress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التقدم</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                <Text style={styles.progressStats}>
                  {completedCount} من {totalCount} درس مكتمل
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدروس ({totalCount})</Text>
          
          {progress?.lessons && progress.lessons.length > 0 ? (
            progress.lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.lesson_id}
                style={styles.lessonCard}
                onPress={() => handleLessonPress(lesson.lesson_id)}
                activeOpacity={0.7}
              >
                <View style={styles.lessonLeft}>
                  <View style={[
                    styles.lessonCheck,
                    lesson.is_completed && styles.lessonCheckCompleted
                  ]}>
                    {lesson.is_completed && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonName}>
                      {lesson.lesson_name || `درس #${lesson.lesson_id}`}
                    </Text>
                    {lesson.progress_percentage !== undefined && (
                      <Text style={styles.lessonProgress}>
                        {lesson.progress_percentage}% مكتمل
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.lessonArrow}>◀</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>لا توجد دروس في هذه المحاضرة</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  heroSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lectureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  lectureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  orderText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  lessonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: SPACING.sm,
  },
  lessonCheckCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkIcon: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  lessonProgress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lessonArrow: {
    fontSize: 12,
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});