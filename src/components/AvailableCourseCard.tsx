import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../constants';
import { Course } from '../types';

interface AvailableCourseCardProps {
  course: Course;
  onPress?: () => void;
}

export function AvailableCourseCard({ course, onPress }: AvailableCourseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${course.id}` as any);
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
      android_ripple={{ color: 'rgba(99, 102, 241, 0.1)' }}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFBFF'] as const}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.courseName} numberOfLines={2}>
              {course.name}
            </Text>
            {course.training_center_name && (
              <Text style={styles.centerName} numberOfLines={1}>
                📍 {course.training_center_name}
              </Text>
            )}
          </View>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5'] as const}
              style={styles.iconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconText}>📚</Text>
            </LinearGradient>
          </View>
        </View>

        {course.course_goal && (
          <Text style={styles.description} numberOfLines={2}>
            {course.course_goal}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            {course.start_date && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>{formatDate(course.start_date)}</Text>
              </View>
            )}
            {course.duration_in_days && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoText}>{course.duration_in_days} يوم</Text>
              </View>
            )}
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>عرض التفاصيل</Text>
            <Text style={styles.actionArrow}>◀</Text>
          </View>
        </View>
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 4,
  },
  centerName: {
    fontSize: 12,
    color: '#6B7280',
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  iconText: {
    fontSize: 20,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
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
    borderTopColor: '#F3F4F6',
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
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  actionArrow: {
    fontSize: 10,
    color: '#6366F1',
  },
});
