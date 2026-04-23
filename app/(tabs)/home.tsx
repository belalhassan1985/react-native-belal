import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHomeData } from '../../src/hooks/useHomeData';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants';
import { EmptyState } from '../../src/components';
import { TraineeCourse, Course } from '../../src/types';

interface NormalizedCourse {
  id: number;
  title: string;
  description: string;
  trainingCenterName: string;
  status: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  startDate: string;
  endDate: string;
  imageUrl: string | undefined;
}

function normalizeActiveCourse(course: TraineeCourse): NormalizedCourse {
  console.log('[Home] normalizeActiveCourse - raw:', JSON.stringify(course));
  return {
    id: course?.id || 0,
    title: course?.course_title || '',
    description: course?.course_description || '',
    trainingCenterName: course?.training_center_name || '',
    status: course?.status || 'pending',
    progressPercentage: course?.progress_percentage || 0,
    completedLessons: course?.completed_lessons || 0,
    totalLessons: course?.total_lessons || 0,
    startDate: course?.start_date || '',
    endDate: course?.end_date || '',
    imageUrl: course?.course_image_url,
  };
}

function normalizeAvailableCourse(course: Course): NormalizedCourse {
  console.log('[Home] normalizeAvailableCourse - raw:', JSON.stringify(course));
  return {
    id: course?.id || 0,
    title: course?.name || '',
    description: course?.course_goal || '',
    trainingCenterName: course?.training_center_name || '',
    status: course?.course_status || course?.status || 'pending',
    progressPercentage: 0,
    completedLessons: 0,
    totalLessons: 0,
    startDate: course?.start_date || '',
    endDate: course?.end_date || '',
    imageUrl: course?.image_url,
  };
}

export default function HomeScreen() {
  const { activeCourses, availableCourses, isLoading, error, refetch } = useHomeData();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const onCoursePress = (courseId: number, courseTitle: string) => {
    console.log('[HomeScreen] onCoursePress:', courseId, courseTitle);
    router.push(`/course/${courseId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'approved': return 'متاح';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'pending': return '#F59E0B';
      case 'approved': return COLORS.success;
      case 'expired': return COLORS.secondary;
      default: return COLORS.secondary;
    }
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.content}>
          <View style={styles.section}>
            <SkeletonTitle />
            <View style={styles.cardList}>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <EmptyState
          title="حدث خطأ"
          message={error}
          icon="⚠️"
        />
      </SafeAreaView>
    );
  }

  const hasActiveCourses = Array.isArray(activeCourses) && activeCourses.length > 0;
  const hasAvailableCourses = Array.isArray(availableCourses) && availableCourses.length > 0;

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
          <Text style={styles.greeting}>مرحباً</Text>
          <Text style={styles.subtitle}>استمر في رحلتك التعليمية</Text>
        </View>

        {hasActiveCourses && (
          <View style={styles.section}>
            <SectionHeader
              title="الدورات النشطة"
              subtitle="أكمل تدريبك الحالي"
            />
            <View style={styles.cardList}>
              {activeCourses.map((course) => {
                const normalized = normalizeActiveCourse(course);
                console.log('[Home] Render active card:', normalized.title, normalized.trainingCenterName);
                return (
                  <Pressable
                    key={normalized.id}
                    style={({ pressed }) => [
                      styles.courseCard,
                      pressed && styles.courseCardPressed,
                    ]}
                    onPress={() => onCoursePress(normalized.id, normalized.title)}
                  >
                    {normalized.imageUrl && (
                      <View style={styles.cardImageContainer}>
                        <View style={[styles.cardImage, { backgroundColor: COLORS.surfaceLight }]}>
                          <Text style={styles.cardImageText}>🏋️</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(normalized.status) }]}>
                          <Text style={styles.statusText}>
                            {getStatusLabel(normalized.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {normalized.title || 'بدون عنوان'}
                      </Text>
                      
                      {normalized.trainingCenterName && (
                        <Text style={styles.cardCenter}>
                          🏢 {normalized.trainingCenterName}
                        </Text>
                      )}
                      
                      {normalized.description && (
                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {normalized.description}
                        </Text>
                      )}
                      
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>تقدمك</Text>
                          <Text style={styles.progressPercent}>
                            {normalized.progressPercentage}%
                          </Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${normalized.progressPercentage}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressDetail}>
                          {normalized.completedLessons} من {normalized.totalLessons} درس مكتمل
                        </Text>
                      </View>
                      
                      <View style={styles.cardFooter}>
                        <View style={styles.dateInfo}>
                          <Text style={styles.dateLabel}>📅</Text>
                          <Text style={styles.dateValue}>
                            {formatDate(normalized.startDate)}
                          </Text>
                        </View>
                        <View style={styles.cta}>
                          <Text style={styles.ctaText}>متابعة</Text>
                          <Text style={styles.ctaArrow}>→</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {!hasActiveCourses && hasAvailableCourses && (
          <View style={styles.section}>
            <SectionHeader
              title="الدورات المتاحة"
              subtitle="اختر دورة للبدء"
            />
            <View style={styles.cardList}>
              {availableCourses.slice(0, 5).map((course) => {
                const normalized = normalizeAvailableCourse(course);
                console.log('[Home] Render available card:', normalized.title, normalized.trainingCenterName);
                return (
                  <Pressable
                    key={normalized.id}
                    style={({ pressed }) => [
                      styles.courseCard,
                      pressed && styles.courseCardPressed,
                    ]}
                    onPress={() => onCoursePress(normalized.id, normalized.title)}
                  >
                    {normalized.imageUrl && (
                      <View style={styles.cardImageContainer}>
                        <View style={[styles.cardImage, { backgroundColor: COLORS.surfaceLight }]}>
                          <Text style={styles.cardImageText}>📚</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(normalized.status) }]}>
                          <Text style={styles.statusText}>
                            {getStatusLabel(normalized.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitleBlue} numberOfLines={2}>
                        {normalized.title || 'بدون عنوان'}
                      </Text>
                      
                      {normalized.trainingCenterName && (
                        <Text style={styles.cardCenter}>
                          🏢 {normalized.trainingCenterName}
                        </Text>
                      )}
                      
                      {normalized.description ? (
                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {normalized.description}
                        </Text>
                      ) : null}
                      
                      <View style={styles.cardFooter}>
                        <View style={styles.dateInfo}>
                          <Text style={styles.dateLabel}>📅</Text>
                          <Text style={styles.dateValue}>
                            يبدأ {formatDate(normalized.startDate)}
                          </Text>
                        </View>
                        <View style={styles.cta}>
                          <Text style={styles.ctaText}>تسجيل</Text>
                          <Text style={styles.ctaArrow}>→</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {!hasActiveCourses && !hasAvailableCourses && (
          <EmptyState
            title="لا توجد دورات متاحة"
            message="تواصل مع مركز التدريب للحصول على دورات جديدة"
            icon="📚"
          />
        )}

        {hasActiveCourses && hasAvailableCourses && (
          <View style={styles.section}>
            <SectionHeader
              title="استكشف المزيد"
              subtitle="دورات متاحة للتسجيل"
            />
            <View style={styles.cardList}>
              {availableCourses.slice(0, 3).map((course) => (
                <Pressable
                  key={course.id}
                  style={({ pressed }) => [
                    styles.courseCard,
                    pressed && styles.courseCardPressed,
                  ]}
                  onPress={() => onCoursePress(course.id, course.title)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitleBlue} numberOfLines={2}>
                      {course.title}
                    </Text>
                    <Text style={styles.cardCenter}>
                      🏢 {course.training_center_name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function SkeletonTitle() {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
    </View>
  );
}

function CourseCardSkeleton() {
  return (
    <View style={styles.courseCard}>
      <View style={styles.skeletonCardTitle} />
      <View style={styles.skeletonCardCenter} />
      <View style={styles.skeletonCardFooter} />
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
    lineHeight: 24,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  cardList: {
    marginTop: SPACING.sm,
  },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseCardPressed: {
    backgroundColor: COLORS.surfaceLight,
    transform: [{ scale: 0.98 }],
  },
  cardImageContainer: {
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: {
    fontSize: 40,
  },
  cardContent: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.xs,
  },
  cardHeader: {
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 22,
  },
  cardTitleBlue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
    lineHeight: 22,
  },
  cardCenter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  progressSection: {
    marginBottom: SPACING.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressDetail: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    marginEnd: 4,
  },
  dateValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginEnd: 4,
  },
  ctaArrow: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
  },
  skeletonTitle: {
    width: 140,
    height: 24,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  skeletonSubtitle: {
    width: 100,
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  skeletonCardTitle: {
    width: '80%',
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  skeletonCardCenter: {
    width: '50%',
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  skeletonCardFooter: {
    width: '30%',
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
});