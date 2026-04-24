import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { courseService, CourseQueryParams } from '../../src/services/courseService';
import { Course } from '../../src/types';
import { AvailableCourseCard } from '../../src/components/AvailableCourseCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

const PAGE_SIZE = 20;

export default function CoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);

  const fetchCourses = useCallback(async (pageNum: number, search?: string, refresh = false) => {
    if (isLoadingRef.current) return;
    if (!refresh && pageNum > 1 && (isLoadingMore || !hasMore)) return;
    
    isLoadingRef.current = true;
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      
      const params: CourseQueryParams = {
        page: pageNum,
        pageItemsCount: PAGE_SIZE,
        minified: true,
        isPending: false,
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await courseService.getAllCourses(params);
      
      const items = response.data?.items || response.data || [];
      
      if (refresh || pageNum === 1) {
        setCourses(items);
      } else {
        setCourses(prev => [...prev, ...items]);
      }
      
      const total = response.data?.total || items.length;
      const prevCount = refresh || pageNum === 1 ? 0 : courses.length;
      setHasMore(prevCount + items.length < total);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الدورات');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [isLoadingMore, hasMore]);

  const fetchCoursesRef = useRef(fetchCourses);
  useEffect(() => {
    fetchCoursesRef.current = fetchCourses;
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses(1);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
    fetchCoursesRef.current(1, text, true);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchCoursesRef.current(1, searchQuery, true);
  }, [searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCoursesRef.current(nextPage, searchQuery);
    }
  }, [isLoadingMore, hasMore, page, searchQuery]);

  const handleCoursePress = (courseId: number) => {
    router.push(`/course/${courseId}`);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <AvailableCourseCard
      course={item}
      onPress={() => handleCoursePress(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن الدورات..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>لا توجد دورات</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery ? 'لا توجد نتائج للبحث' : 'لم يتم العثور على دورات متاحة'}
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchCoursesRef.current(1, searchQuery, true)}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (isLoading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الدورات المتاحة</Text>
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
        <Text style={styles.headerTitle}>الدورات المتاحة</Text>
        <Text style={styles.headerSubtitle}>{courses.length} دورة</Text>
      </View>
      
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginEnd: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
    padding: SPACING.xs,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
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
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});