import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants';
import { Course } from '../types';

interface AvailableCourseCardProps {
  course: Course;
  onPress?: () => void;
}

function AvailableCourseCardComponent({ course, onPress }: AvailableCourseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${course.id}`);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
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
              {course.name}
            </Text>
            {course.training_center_name ? (
              <Text style={styles.centerName} numberOfLines={1}>
                📍 {course.training_center_name}
              </Text>
            ) : null}
          </View>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📚</Text>
            </View>
          </View>
        </View>

        {course.course_goal ? (
          <Text style={styles.description} numberOfLines={2}>
            {course.course_goal}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            {course.start_date ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>{formatDate(course.start_date)}</Text>
              </View>
            ) : null}
            {course.duration_in_days ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoText}>{course.duration_in_days} يوم</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>عرض التفاصيل</Text>
            <Text style={styles.actionArrow}>◀</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const AvailableCourseCard = memo(AvailableCourseCardComponent);

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
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    marginEnd: SPACING.sm,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 4,
  },
  centerName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  iconText: {
    fontSize: 20,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionArrow: {
    fontSize: 10,
    color: COLORS.primary,
  },
});
