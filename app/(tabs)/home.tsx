import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CourseCard,
  PublicCourseCard,
  CourseCardSkeleton,
  EmptyState,
} from '../../src/components';
import { useHomeData } from '../../src/hooks/useHomeData';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants';

export default function HomeScreen() {
  const { activeCourses, availableCourses, isLoading, error, refetch } = useHomeData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
              {activeCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="featured"
                />
              ))}
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
              {availableCourses.slice(0, 5).map((course) => (
                <PublicCourseCard
                  key={course.id}
                  course={course}
                />
              ))}
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
                <PublicCourseCard
                  key={course.id}
                  course={course}
                />
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
    paddingVertical: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
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
});