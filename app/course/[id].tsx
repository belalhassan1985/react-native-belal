import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../../src/services/courseService';
import { joinRequestService } from '../../src/services/joinRequestService';
import { Course, CourseLecture, CourseProgress, CourseJoinStatus } from '../../src/types';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '../../src/constants';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const courseId = Number(id) || 0;

  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<CourseLecture[]>([]);
  const [joinStatus, setJoinStatus] = useState<CourseJoinStatus>({ has_request: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(new Set());
  const isLoadingRef = useRef(false);

  const loadCourseData = useCallback(async () => {
    const cid = Number(id);
    
    if (!cid || isNaN(cid)) {
      setError('معرف الدورة غير صالح');
      setIsLoading(false);
      return;
    }

    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    try {
      setError(null);

      const [progressResponse, detailsResponse, lecturesResponse, statusResponse] = await Promise.allSettled([
        courseService.getCourseProgress(cid),
        courseService.getCourse(cid),
        courseService.getCourseLecturesAndLessons(cid),
        joinRequestService.getCourseStatus(cid),
      ]);

      if (progressResponse.status === 'fulfilled' && progressResponse.value?.data) {
        setCourseProgress(progressResponse.value.data);
      }

      if (detailsResponse.status === 'fulfilled' && detailsResponse.value?.data) {
        setCourseDetails(detailsResponse.value.data);
      }

      if (lecturesResponse.status === 'fulfilled' && lecturesResponse.value?.data) {
        const lecturesData = lecturesResponse.value.data.lectures || [];
        setLectures(Array.isArray(lecturesData) ? lecturesData : []);
      }

      if (statusResponse.status === 'fulfilled') {
        setJoinStatus(joinRequestService.parseCourseStatus(statusResponse.value));
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تحميل البيانات';
      setError(message);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [id]);

  const loadCourseDataRef = useRef(loadCourseData);
  useEffect(() => {
    loadCourseDataRef.current = loadCourseData;
  }, [loadCourseData]);

  useEffect(() => {
    loadCourseData();
  }, []);

  const handleJoinRequest = useCallback(async () => {
    const cid = Number(id) || 0;
    if (!cid || isJoining) return;

    setIsJoining(true);
    try {
      const response = await joinRequestService.createRequest(courseId);
      if (response.status === 'success' && response.data) {
        setJoinStatus({
          has_request: true,
          request_id: response.data.id,
          status: response.data.status,
        });
        Alert.alert('نجاح', 'تم إرسال طلب الانضمام بنجاح');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل إرسال الطلب';
      Alert.alert('خطأ', message);
    } finally {
      setIsJoining(false);
    }
  }, [courseId, isJoining]);

  const toggleLecture = (lectureId: number) => {
    setExpandedLectures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lectureId)) {
        newSet.delete(lectureId);
      } else {
        newSet.add(lectureId);
      }
      return newSet;
    });
  };

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'غير محدد';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'غير محدد';
    }
  };

  const getRemainingDays = () => {
    if (!courseDetails?.end_date) return null;
    try {
      const endDate = new Date(courseDetails.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!courseProgress && !courseDetails)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'فشل تحميل البيانات'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCourseData}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = courseProgress?.progress_percentage === 100;
  const courseName = courseProgress?.course_name || courseDetails?.name || 'دورة تدريبية';
  const remainingDays = getRemainingDays();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {courseDetails?.image_url && (
          <Image
            source={{ uri: courseDetails.image_url }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.heroSection}>
          <View style={styles.titleRow}>
            <Text style={styles.courseName}>{courseName}</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          {courseDetails?.category_name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>📚 {courseDetails.category_name}</Text>
            </View>
          )}

          {courseDetails?.training_center_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏢</Text>
              <Text style={styles.infoText}>{courseDetails.training_center_name}</Text>
            </View>
          )}
        </View>

        {!courseProgress && (
          <View style={styles.section}>
            <JoinCTA
              status={joinStatus}
              isLoading={isJoining}
              onJoin={handleJoinRequest}
            />
          </View>
        )}

        {courseProgress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نسبة الإنجاز</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressValue}>{courseProgress.progress_percentage.toFixed(0)}%</Text>
                <Text style={styles.progressStatText}>
                  {courseProgress.completed_lectures} من {courseProgress.total_lectures} محاضرة
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${courseProgress.progress_percentage}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {courseDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الدورة</Text>
            <View style={styles.infoCard}>
              {courseDetails.course_goal && (
                <InfoItem icon="🎯" label="الهدف" value={courseDetails.course_goal} multiline />
              )}
              <InfoItem icon="📅" label="تاريخ البداية" value={formatDate(courseDetails.start_date)} />
              <InfoItem icon="📆" label="تاريخ النهاية" value={formatDate(courseDetails.end_date)} />
              {courseDetails.duration_in_days ? (
                <InfoItem icon="⏱️" label="المدة" value={`${courseDetails.duration_in_days} يوم`} />
              ) : null}
              {courseDetails.trainees_count ? (
                <InfoItem icon="👥" label="عدد المتدربين" value={String(courseDetails.trainees_count)} />
              ) : null}
            </View>
          </View>
        )}

        {remainingDays !== null && remainingDays > 0 && (
          <View style={styles.section}>
            <View style={styles.remainingDaysCard}>
              <Text style={styles.remainingDaysText}>
                🎯 متبقي {remainingDays} يوم على انتهاء الدورة
              </Text>
            </View>
          </View>
        )}

        {lectures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المحاضرات ({lectures.length})</Text>
            {courseProgress && (
              <Text style={styles.sectionSubtitle}>
                {courseProgress.completed_lectures} من {courseProgress.total_lectures} محاضرة مكتملة
              </Text>
            )}
            {lectures.map((lecture, index) => {
              const isExpanded = expandedLectures.has(lecture.id);
              const lectureProgress = courseProgress?.lectures?.find(l => l.lecture_id === lecture.id);

              return (
                <View key={lecture.id} style={styles.lectureCard}>
                  <TouchableOpacity
                    style={styles.lectureHeader}
                    onPress={() => toggleLecture(lecture.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lectureLeft}>
                      <View style={[
                        styles.lectureNumber,
                        lectureProgress?.progress_percentage === 100 && styles.lectureNumberCompleted
                      ]}>
                        <Text style={[
                          styles.lectureNumberText,
                          lectureProgress?.progress_percentage === 100 && styles.lectureNumberTextCompleted
                        ]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.lectureInfo}>
                        <Text style={styles.lectureName}>{lecture.title}</Text>
                        {lectureProgress ? (
                          <View style={styles.lectureProgressRow}>
                            <View style={styles.lectureProgressBar}>
                              <View style={[
                                styles.lectureProgressFill,
                                { width: `${lectureProgress.progress_percentage}%` }
                              ]} />
                            </View>
                            <Text style={styles.lectureStats}>
                              {lectureProgress.completed_lessons}/{lectureProgress.total_lessons}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.lectureStats}>لم يبدأ</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isExpanded && lectureProgress && lectureProgress.lessons.length > 0 && (
                    <View style={styles.lessonsContainer}>
                      {lectureProgress.lessons.map((lessonProgress) => (
                        <TouchableOpacity
                          key={lessonProgress.lesson_id}
                          style={styles.lessonRow}
                          onPress={() => router.push(`/lesson/${lessonProgress.lesson_id}`)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.lessonLeft}>
                            <View style={[
                              styles.lessonCheck,
                              lessonProgress.is_completed && styles.lessonCheckCompleted
                            ]}>
                              {lessonProgress.is_completed && (
                                <Text style={styles.lessonCheckIcon}>✓</Text>
                              )}
                            </View>
                            <Text style={styles.lessonName}>
                              {lessonProgress.lesson_name || `درس #${lessonProgress.lesson_id}`}
                            </Text>
                          </View>
                          <Text style={styles.lessonArrow}>◀</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {lectures.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>لا توجد محاضرات متاحة</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function JoinCTA({ status, isLoading, onJoin }: {
  status: CourseJoinStatus;
  isLoading: boolean;
  onJoin: () => void;
}) {
  if (status.has_request && status.status) {
    const statusConfig = {
      pending: { label: 'قيد المراجعة', color: COLORS.warning, bg: COLORS.warning + '20' },
      accepted: { label: 'تم القبول', color: COLORS.success, bg: COLORS.success + '20' },
      rejected: { label: 'مرفوض', color: COLORS.error, bg: COLORS.error + '20' },
    }[status.status] ?? { label: 'غير معروف', color: COLORS.textMuted, bg: COLORS.surface };

    return (
      <View style={styles.infoCard}>
        <View style={[styles.statusBadgeContainer, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.joinButton}
      onPress={onJoin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.text} />
      ) : (
        <>
          <Text style={styles.joinButtonIcon}>📝</Text>
          <Text style={styles.joinButtonText}>طلب الانضمام</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function InfoItem({ icon, label, value, multiline }: { icon: string; label: string; value: string; multiline?: boolean }) {
  const safeValue = value ?? '';
  if (!safeValue) return null;
  
  return (
    <View style={styles.infoRowItem}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>{safeValue}</Text>
      </View>
    </View>
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
  courseImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
  },
  heroSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginEnd: SPACING.sm,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressStatText: {
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
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoContent: {
    flex: 1,
    marginStart: SPACING.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  infoValueMultiline: {
    lineHeight: 20,
  },
  remainingDaysCard: {
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  remainingDaysText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  lectureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  lectureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  lectureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lectureNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: SPACING.sm,
  },
  lectureNumberCompleted: {
    backgroundColor: COLORS.successLight + '30',
  },
  lectureNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  lectureNumberTextCompleted: {
    color: COLORS.success,
  },
  lectureInfo: {
    flex: 1,
  },
  lectureName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  lectureStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  joinButtonIcon: {
    fontSize: 18,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadgeContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  lectureProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: SPACING.sm,
  },
  lectureProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  lectureProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  lessonsContainer: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
  lessonCheckIcon: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '700',
  },
  lessonName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    textAlign: 'right',
  },
  lessonArrow: {
    fontSize: 10,
    color: COLORS.primary,
    marginStart: SPACING.sm,
  },
});