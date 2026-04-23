import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../../src/services/courseService';
import { Course, CourseLecture, CourseLesson } from '../../src/types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants';

interface NormalizedCourse {
  id: number;
  title: string;
  description: string;
  conditions: string;
  durationInDays: number;
  imageUrl: string | undefined;
  startDate: string;
  endDate: string;
  status: string;
  traineesCount: number;
  beneficiaries: string;
  trainingCenterName: string;
}

function normalizeCourse(course: Course): NormalizedCourse {
  console.log('[CourseDetail] Raw course:', JSON.stringify(course));
  return {
    id: course?.id || 0,
    title: course?.name || '',
    description: course?.course_goal || '',
    conditions: course?.course_conditions || '',
    durationInDays: course?.duration_in_days || 0,
    imageUrl: course?.image_url,
    startDate: course?.start_date || '',
    endDate: course?.end_date || '',
    status: course?.course_status || 'pending',
    traineesCount: course?.trainees_count || 0,
    beneficiaries: course?.beneficiaries || '',
    trainingCenterName: course?.training_center_name || '',
  };
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id) || 0;
  
  console.log('[DEBUG] useLocalSearchParams id:', id);
  console.log('[DEBUG] Parsed courseId:', courseId);
  
  const router = useRouter();

  const [course, setCourse] = useState<NormalizedCourse | null>(null);
  const [lectures, setLectures] = useState<CourseLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLectures, setExpandedLectures] = useState<number[]>([]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId || courseId <= 0) {
      setError('معرف الدورة غير صالح');
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      console.log('[DEBUG] Fetching course with ID:', courseId);
      
      const res = await courseService.getCourseById(courseId);
      console.log('[CourseDetail] Full API response:', JSON.stringify(res));

      // The API returns { status, data } where data is the course directly
      let courseData = res.data;
      
      // If response wraps the course in another layer, handle it
      if (!courseData?.name && !courseData?.id && res.data?.data) {
        courseData = res.data.data;
      }
      
      console.log('[CourseDetail] Course data extracted:', JSON.stringify(courseData));

      if (res.status === 'success' && courseData?.id) {
        const normalized = normalizeCourse(courseData);
        console.log('[CourseDetail] Course title:', normalized.title);
        setCourse(normalized);

        // Try to fetch lectures separately - won't block course display
        try {
          const contentRes = await courseService.getCourseLecturesAndLessons(courseId);
          console.log('[CourseDetail] Lectures API response:', JSON.stringify(contentRes));
          
          let lecturesData = contentRes.data?.lectures || [];
          if (contentRes.data?.data?.lectures) {
            lecturesData = contentRes.data.data.lectures;
          }
          
          console.log('[CourseDetail] Lectures:', JSON.stringify(lecturesData));
          setLectures(lecturesData);
        } catch (le) {
          console.log('[CourseDetail] Lectures fetch failed:', le);
        }
      } else {
        console.log('[CourseDetail] No valid course data - status:', res.status);
        setError('لم يتم العثور على الدورة');
      }
    } catch (err) {
      console.log('[CourseDetail] Error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourseData();
    setRefreshing(false);
  };

  const toggleLecture = (lectureId: number) => {
    setExpandedLectures(prev =>
      prev.includes(lectureId)
        ? prev.filter(id => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'approved': return 'متاح';
      case 'pending': return 'قيد الانتظار';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'pending': return '#F59E0B';
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
        <View style={styles.loadingContainer}>
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
          <TouchableOpacity onPress={fetchCourseData} style={styles.retryButton}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>لا توجد بيانات</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack.Screen options={{ headerShown: false }} />
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
        {course.imageUrl && (
          <Image
            source={{ uri: course.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(course.status)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>

          {course.trainingCenterName && (
            <Text style={styles.center}>🏢 {course.trainingCenterName}</Text>
          )}

          {course.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الوصف</Text>
              <Text style={styles.description}>{course.description}</Text>
            </View>
          )}

          {course.conditions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الشروط</Text>
              <Text style={styles.description}>{course.conditions}</Text>
            </View>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>المدة</Text>
              <Text style={styles.infoValue}>{course.durationInDays} يوم</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>العدد</Text>
              <Text style={styles.infoValue}>{course.traineesCount} متدرب</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>يبدأ</Text>
              <Text style={styles.infoValue}>{formatDate(course.startDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ينتهي</Text>
              <Text style={styles.infoValue}>{formatDate(course.endDate)}</Text>
            </View>
          </View>

          {course.beneficiaries && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الفئة المستهدفة</Text>
              <Text style={styles.description}>{course.beneficiaries}</Text>
            </View>
          )}

          {lectures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المحتوى ({lectures.length} محاضرة)</Text>
              {lectures.map((lecture, index) => (
                <View key={lecture.id} style={styles.lectureCard}>
                  <Pressable
                    style={styles.lectureHeader}
                    onPress={() => toggleLecture(lecture.id)}
                  >
                    <View style={styles.lectureInfo}>
                      <Text style={styles.lectureNumber}>محاضرة {index + 1}</Text>
                      <Text style={styles.lectureTitle}>{lecture.title}</Text>
                    </View>
                    <Text style={styles.expandIcon}>
                      {expandedLectures.includes(lecture.id) ? '▼' : '▶'}
                    </Text>
                  </Pressable>
                </View>
              ))}
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
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surfaceLight,
  },
  content: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  center: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  infoGrid: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  lectureCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  lectureInfo: {
    flex: 1,
  },
  lectureNumber: {
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 2,
  },
  lectureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'right',
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});