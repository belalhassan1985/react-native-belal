import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants';
import { CourseProgress } from '../types';

interface ModernCourseCardProps {
  course: CourseProgress;
  onPress?: () => void;
}

function ModernCourseCardComponent({ course, onPress }: ModernCourseCardProps) {
  const router = useRouter();
  const progress = course.progress_percentage || 0;
  const isCompleted = progress === 100;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${course.course_id}`);
    }
  };

  const getProgressColor = (): readonly [string, string, string] => {
    if (isCompleted) return ['#10B981', '#059669', '#10B981'];
    if (progress >= 75) return ['#F59E0B', '#D97706', '#F59E0B'];
    if (progress >= 50) return ['#3B82F6', '#2563EB', '#3B82F6'];
    return ['#6366F1', '#4F46E5', '#818CF8'];
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      android_ripple={{ color: COLORS.primary + '20' }}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.courseName} numberOfLines={2}>
              {course.course_name}
            </Text>
          </View>
          <View style={styles.progressCircleContainer}>
            <LinearGradient
              colors={getProgressColor()}
              style={styles.progressCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]}>
            <LinearGradient
              colors={getProgressColor()}
              style={styles.progressBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>{course.total_lectures}</Text>
            <Text style={styles.statLabel}>محاضرة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{course.completed_lectures}</Text>
            <Text style={styles.statLabel}>مكتملة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>
              {course.total_lectures - course.completed_lectures}
            </Text>
            <Text style={styles.statLabel}>متبقي</Text>
          </View>
        </View>

        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>🎉 مكتملة</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export const ModernCourseCard = memo(ModernCourseCardComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginEnd: SPACING.md,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 24,
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarGradient: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  completedBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
});
