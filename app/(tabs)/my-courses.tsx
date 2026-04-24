import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { lessonProgressService } from '../../src/services/lessonProgressService';
import { TraineeCourse } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

type FilterType = 'all' | 'active' | 'completed';

export default function MyCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<TraineeCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<TraineeCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const isLoadingRef = useRef(false);

  const fetchMyCourses = useCallback(async (refresh = false) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      
      const response = await lessonProgressService.getMyCourses();
      
      const items = response.data || [];
      setCourses(items);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الدورات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, []);

  const fetchMyCoursesRef = useRef(fetchMyCourses);
  useEffect(() => {
    fetchMyCoursesRef.current = fetchMyCourses;
  }, [fetchMyCourses]);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (filter === 'active') {
      filtered = courses.filter(c => c.status === 'active');
    } else if (filter === 'completed') {
      filtered = courses.filter(c => c.status === 'completed');
    }
    
    setFilteredCourses(filtered);
  }, [filter, courses]);

  const handleRefresh = useCallback(() => {
    fetchMyCoursesRef.current(true);
  }, []);

  const handleCoursePress = (courseId: number) => {
    router.push(`/course/${courseId}`);
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return { text: 'نشط', color: COLORS.primary, bg: COLORS.primaryLight + '20' };
      case 'completed':
        return { text: 'مكتمل', color: COLORS.success, bg: COLORS.successLight + '20' };
      case 'pending':
        return { text: 'قيد الانتظار', color: COLORS.warning, bg: COLORS.warningLight + '20' };
      default:
        return { text: 'غير محدد', color: COLORS.textMuted, bg: COLORS.surfaceLight };
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'غير محدد';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'غير محدد';
    }
  };

  const renderCourse = ({ item }: { item: TraineeCourse }) => {
    const badge = getStatusBadge(item.status);
    
    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => handleCoursePress(item.course_id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {item.course_title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>
          
          {item.training_center_name && (
            <Text style={styles.centerName} numberOfLines={1}>
              🏢 {item.training_center_name}
            </Text>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>نسبة الإنجاز</Text>
            <Text style={styles.progressValue}>{item.progress_percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${item.progress_percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressStats}>
            {item.completed_lessons} من {item.total_lessons} درس
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            📅 {formatDate(item.start_date)} - {formatDate(item.end_date)}
          </Text>
          <Text style={styles.viewMore}>عرض التفاصيل ←</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterButtonText, filter === type && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>لا توجد دورات</Text>
        <Text style={styles.emptySubtitle}>
          {filter === 'all' 
            ? 'لم تسجل في أي دورة بعد'
            : filter === 'active'
            ? 'لا توجد دورات نشطة'
            : 'لا توجد دورات مكتملة'}
        </Text>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchMyCoursesRef.current(true)}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>دوراتي</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>دوراتي</Text>
        <Text style={styles.headerSubtitle}>{courses.length} دورة</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'الكل')}
        {renderFilterButton('active', 'نشطة')}
        {renderFilterButton('completed', 'مكتملة')}
      </View>
      
      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => String(item.course_id)}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderError}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginEnd: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressStats: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  viewMore: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});