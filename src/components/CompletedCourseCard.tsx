import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../constants';
import { CourseProgress } from '../types';

interface CompletedCourseCardProps {
  course: CourseProgress;
  onPress?: () => void;
}

export function CompletedCourseCard({ course, onPress }: CompletedCourseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${course.course_id}`);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.successBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>مكتملة</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.courseName} numberOfLines={2}>
              {course.course_name}
            </Text>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>🏆</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📚</Text>
              <View>
                <Text style={styles.statValue}>{course.total_lectures}</Text>
                <Text style={styles.statLabel}>محاضرة</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>✅</Text>
              <View>
                <Text style={styles.statValue}>{course.completed_lectures}</Text>
                <Text style={styles.statLabel}>مكتملة</Text>
              </View>
            </View>
          </View>

          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>100% إنجاز</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  successIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  courseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    marginRight: SPACING.sm,
  },
  achievementBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  completionBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});
