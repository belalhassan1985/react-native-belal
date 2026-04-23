import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../constants';
import { CourseProgress } from '../types';

const { width } = Dimensions.get('window');

interface ModernCourseCardProps {
  course: CourseProgress;
  onPress?: () => void;
}

export function ModernCourseCard({ course, onPress }: ModernCourseCardProps) {
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

  const getProgressColor = (): readonly [string, string] => {
    if (isCompleted) return ['#10B981', '#059669'] as const;
    if (progress >= 75) return ['#F59E0B', '#D97706'] as const;
    if (progress >= 50) return ['#3B82F6', '#2563EB'] as const;
    return ['#6366F1', '#4F46E5'] as const;
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(59, 130, 246, 0.1)' }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
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
          <LinearGradient
            colors={getProgressColor()}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
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
            <Text style={styles.statLabel}>متبقية</Text>
          </View>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>🎉 مكتملة</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 24,
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
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
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  completedBadge: {
    marginTop: SPACING.sm,
    backgroundColor: '#D1FAE5',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});
