import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BORDER_RADIUS, SPACING } from '../../src/constants';
import { courseService } from '../../src/services/courseService';
import { Course, CourseLecture, CourseProgress, LectureProgress } from '../../src/types';

const { width } = Dimensions.get('window');

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const router = useRouter();

  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<CourseLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId) {
      setError('معرف الدورة غير صالح');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const [progressResponse, detailsResponse, lecturesResponse] = await Promise.allSettled([
        courseService.getCourseProgress(courseId),
        courseService.getCourseById(courseId),
        courseService.getCourseLecturesAndLessons(courseId),
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

    } catch (err: any) {
      console.error('[CourseDetails] Error:', err);
      setError(err.message || 'فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDate = (dateStr: string | undefined) => {
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
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الدورة</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!courseProgress && !courseDetails)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)} style={styles.backButton}>
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)} style={styles.backButton}>
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

        <LinearGradient
          colors={isCompleted ? ['#D1FAE5', '#F8FAFC'] as const : ['#EEF2FF', '#F8FAFC'] as const}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
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
        </LinearGradient>

        {courseProgress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نسبة الإنجاز</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressValue}>{courseProgress.progress_percentage.toFixed(0)}%</Text>
                <View style={styles.progressStats}>
                  <Text style={styles.progressStatText}>
                    {courseProgress.completed_lectures} من {courseProgress.total_lectures} محاضرة
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={isCompleted ? ['#10B981', '#059669'] as const : ['#3B82F6', '#2563EB'] as const}
                  style={[styles.progressBarFill, { width: `${courseProgress.progress_percentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
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
              {courseDetails.course_conditions && (
                <InfoItem icon="📋" label="الشروط" value={courseDetails.course_conditions} multiline />
              )}
              {courseDetails.beneficiaries && (
                <InfoItem icon="👥" label="المستفيدون" value={courseDetails.beneficiaries} />
              )}
              {courseDetails.duration_in_days && (
                <InfoItem icon="⏱️" label="المدة" value={`${courseDetails.duration_in_days} يوم`} />
              )}
              {courseDetails.max_trainees && (
                <InfoItem icon="👨‍🎓" label="الحد الأقصى" value={`${courseDetails.max_trainees} متدرب`} />
              )}
              {courseDetails.trainees_count !== undefined && (
                <InfoItem icon="✅" label="المسجلون" value={`${courseDetails.trainees_count} متدرب`} />
              )}
            </View>
          </View>
        )}

        {courseDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التواريخ</Text>
            <View style={styles.datesCard}>
              <View style={styles.dateItem}>
                <View style={styles.dateIconContainer}>
                  <LinearGradient
                    colors={['#10B981', '#059669'] as const}
                    style={styles.dateIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.dateIcon}>📅</Text>
                  </LinearGradient>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>تاريخ البدء</Text>
                  <Text style={styles.dateValue}>{formatDate(courseDetails.start_date)}</Text>
                </View>
              </View>
              <View style={styles.dateItem}>
                <View style={styles.dateIconContainer}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626'] as const}
                    style={styles.dateIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.dateIcon}>🏁</Text>
                  </LinearGradient>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>تاريخ الانتهاء</Text>
                  <Text style={styles.dateValue}>{formatDate(courseDetails.end_date)}</Text>
                </View>
              </View>
              {remainingDays !== null && remainingDays > 0 && (
                <View style={styles.remainingDaysCard}>
                  <Text style={styles.remainingDaysText}>
                    ⏳ متبقي {remainingDays} يوم
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {courseProgress && courseProgress.lectures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المحاضرات ({courseProgress.lectures.length})</Text>
            {courseProgress.lectures.map((lecture, index) => (
              <LectureCard
                key={lecture.lecture_id}
                lecture={lecture}
                index={index}
                isExpanded={expandedLectures.has(lecture.lecture_id)}
                onToggle={() => toggleLecture(lecture.lecture_id)}
              />
            ))}
          </View>
        )}

        {lectures.length > 0 && !courseProgress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المحاضرات ({lectures.length})</Text>
            {lectures.map((lecture, index) => (
              <SimpleLectureCard key={lecture.id} lecture={lecture} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  multiline?: boolean;
}

function InfoItem({ icon, label, value, multiline }: InfoItemProps) {
  return (
    <View style={[styles.infoItem, multiline && styles.infoItemMultiline]}>
      <View style={styles.infoItemHeader}>
        <Text style={styles.infoItemIcon}>{icon}</Text>
        <Text style={styles.infoItemLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoItemValue, multiline && styles.infoItemValueMultiline]}>
        {value}
      </Text>
    </View>
  );
}

interface LectureCardProps {
  lecture: LectureProgress;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function LectureCard({ lecture, index, isExpanded, onToggle }: LectureCardProps) {
  const isCompleted = lecture.progress_percentage === 100;
  const hasLessons = lecture.lessons && lecture.lessons.length > 0;

  return (
    <View style={styles.lectureCard}>
      <TouchableOpacity
        style={styles.lectureHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.lectureLeft}>
          <View style={[
            styles.lectureNumber,
            isCompleted && styles.lectureNumberCompleted
          ]}>
            <Text style={[
              styles.lectureNumberText,
              isCompleted && styles.lectureNumberTextCompleted
            ]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.lectureInfo}>
            <Text style={styles.lectureName}>{lecture.lecture_name}</Text>
            {hasLessons && (
              <Text style={styles.lectureStats}>
                {lecture.completed_lessons} من {lecture.total_lessons} دروس
              </Text>
            )}
          </View>
        </View>
        <View style={styles.lectureRight}>
          {isCompleted ? (
            <View style={styles.completedIcon}>
              <Text style={styles.completedIconText}>✓</Text>
            </View>
          ) : (
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>
                {lecture.progress_percentage.toFixed(0)}%
              </Text>
            </View>
          )}
          {hasLessons && (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '◀'}</Text>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && hasLessons && (
        <View style={styles.lessonsContainer}>
          {lecture.lessons.map((lesson, lessonIndex) => (
            <View key={lesson.lesson_id} style={styles.lessonItem}>
              <View style={styles.lessonLeft}>
                <View style={[
                  styles.lessonDot,
                  lesson.is_completed && styles.lessonDotCompleted
                ]} />
                <Text style={[
                  styles.lessonName,
                  lesson.is_completed && styles.lessonNameCompleted
                ]}>
                  {lesson.lesson_name}
                </Text>
              </View>
              {lesson.is_completed && (
                <View style={styles.lessonCompletedBadge}>
                  <Text style={styles.lessonCompletedText}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface SimpleLectureCardProps {
  lecture: CourseLecture;
  index: number;
}

function SimpleLectureCard({ lecture, index }: SimpleLectureCardProps) {
  return (
    <View style={styles.simpleLectureCard}>
      <View style={styles.lectureNumber}>
        <Text style={styles.lectureNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.simpleLectureInfo}>
        <Text style={styles.lectureName}>{lecture.title}</Text>
        {lecture.description && (
          <Text style={styles.lectureDescription}>{lecture.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
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
    backgroundColor: '#E5E7EB',
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
  heroGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroContent: {
    gap: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  courseName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 32,
  },
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressStatText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: SPACING.md,
  },
  infoItem: {
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoItemMultiline: {
    paddingBottom: SPACING.md,
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  infoItemIcon: {
    fontSize: 16,
  },
  infoItemLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 20,
  },
  infoItemValueMultiline: {
    lineHeight: 22,
  },
  datesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: SPACING.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateIconContainer: {
    width: 50,
    height: 50,
  },
  dateIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateIcon: {
    fontSize: 24,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'right',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
  },
  remainingDaysCard: {
    backgroundColor: '#FEF3C7',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  remainingDaysText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  lectureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  lectureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  lectureNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lectureNumberCompleted: {
    backgroundColor: '#D1FAE5',
  },
  lectureNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  lectureNumberTextCompleted: {
    color: '#10B981',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 2,
  },
  lectureStats: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  lectureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIconText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  progressCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  expandIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  lessonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  lessonDotCompleted: {
    backgroundColor: '#10B981',
  },
  lessonName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    flex: 1,
  },
  lessonNameCompleted: {
    color: '#1F2937',
    fontWeight: '600',
  },
  lessonCompletedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonCompletedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  simpleLectureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  simpleLectureInfo: {
    flex: 1,
  },
  lectureDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: SPACING.md,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
  },
  retryText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
