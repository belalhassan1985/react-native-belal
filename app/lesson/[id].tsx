import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../../src/services/courseService';
import { lessonProgressService } from '../../src/services/lessonProgressService';
import { CourseLesson, TraineeLessonProgress } from '../../src/types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LessonVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Number(id) || 0;

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [traineeProgress, setTraineeProgress] = useState<TraineeLessonProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const fetchLessonData = useCallback(async () => {
    if (!lessonId || lessonId <= 0) {
      setError('معرف الدرس غير صالح');
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const [lessonRes, progressRes] = await Promise.allSettled([
        courseService.getLesson(lessonId),
        lessonProgressService.getLessonProgress(lessonId),
      ]);

      if (lessonRes.status === 'fulfilled' && lessonRes.value.status === 'success' && lessonRes.value.data) {
        setLesson(lessonRes.value.data);
      } else {
        setError('لم يتم العثور على الدرس');
        setIsLoading(false);
        return;
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.status === 'success' && progressRes.value.data) {
        setTraineeProgress(progressRes.value.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const handleMarkComplete = async () => {
    if (!lesson || isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      await lessonProgressService.updateProgress({
        lesson_id: lessonId,
        is_completed: true,
      });
      setTraineeProgress(prev => prev ? { ...prev, is_completed: true } : null);
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handlePlayVideo = async () => {
    if (!lesson?.video_url) return;

    try {
      const url = lesson.video_url;
      
      if (url.startsWith('http://')) {
        const secureUrl = url.replace('http://', 'https://');
        const supported = await Linking.canOpenURL(secureUrl);
        if (supported) {
          await Linking.openURL(secureUrl);
          return;
        }
      } else if (url.startsWith('https://')) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to open video:', err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          <TouchableOpacity onPress={fetchLessonData} style={styles.retryButton}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>لا توجد بيانات</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canPlayVideo = lesson.video_url && lesson.video_url.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoContainer}>
          {canPlayVideo ? (
            <TouchableOpacity
              style={styles.videoPlaceholder}
              onPress={handlePlayVideo}
              activeOpacity={0.8}
            >
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <Text style={styles.playText}>تشغيل الفيديو</Text>
              {lesson.duration_minutes ? (
                <Text style={styles.videoDuration}>
                  {lesson.duration_minutes} دقيقة
                </Text>
              ) : null}
            </TouchableOpacity>
          ) : (
            <View style={styles.noVideoContainer}>
              <Text style={styles.noVideoIcon}>🎬</Text>
              <Text style={styles.noVideoText}>لا يتوفر فيديو لهذا الدرس</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>الدرس {lesson.order ?? 1}</Text>
            </View>
            <Text style={styles.title}>{lesson.title ?? 'درس'}</Text>
            {lesson.description ? (
              <Text style={styles.description}>{lesson.description}</Text>
            ) : null}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>المدة</Text>
              </View>
              <Text style={styles.infoValue}>{lesson.duration_minutes ?? 0} دقيقة</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>الحالة</Text>
              </View>
              <View style={[
                styles.statusBadge,
                traineeProgress?.is_completed && styles.statusBadgeCompleted
              ]}>
                <Text style={[
                  styles.statusText,
                  traineeProgress?.is_completed && styles.statusTextCompleted
                ]}>
                  {traineeProgress?.is_completed ? 'مكتمل' : 'قيد التعلم'}
                </Text>
              </View>
            </View>
            {traineeProgress && traineeProgress.watched_seconds > 0 && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Text style={styles.infoLabel}>المشاهدة</Text>
                  </View>
                  <Text style={styles.infoValue}>{traineeProgress.watched_seconds} ثانية</Text>
                </View>
              </>
            )}
          </View>

          {canPlayVideo && !traineeProgress?.is_completed ? (
            <TouchableOpacity
              style={[
                styles.completeButton,
                isMarkingComplete && styles.completeButtonDisabled
              ]}
              onPress={handleMarkComplete}
              disabled={isMarkingComplete}
              activeOpacity={0.8}
            >
              {isMarkingComplete ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.completeButtonText}>تحديد كمكتمل</Text>
              )}
            </TouchableOpacity>
          ) : null}

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>نصائح للمشاهدة</Text>
            <Text style={styles.tipsText}>
              {'\u2022'} شاهد الفيديو بتمعن{'\n'}
              {'\u2022'} توقف عند الحاجة ومرر مرة أخرى{'\n'}
              {'\u2022'} بعد المشاهدة اضغط تحديد كمكتمل{'\n'}
              {'\u2022'} انتقل للدرس التالي للمتابعة
            </Text>
          </View>
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
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playIcon: {
    fontSize: 28,
    color: COLORS.text,
    marginStart: 4,
  },
  playText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  videoDuration: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  noVideoIcon: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  noVideoText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  orderText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  infoLabelContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusBadgeCompleted: {
    backgroundColor: COLORS.success + '30',
  },
  statusText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});