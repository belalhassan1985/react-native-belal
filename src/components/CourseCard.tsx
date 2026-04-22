import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { TraineeCourse } from '../types';
import { COLORS } from '../constants';

interface CourseCardProps {
  course: TraineeCourse;
  onPress?: () => void;
  variant?: 'compact' | 'featured';
}

export function CourseCard({ course, onPress, variant = 'compact' }: CourseCardProps) {
  const isFeatured = variant === 'featured';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, isFeatured && styles.featuredCard]} padding={0}>
        {course.course_image_url && (
          <Image
            source={{ uri: course.course_image_url }}
            style={[styles.image, isFeatured && styles.featuredImage]}
          />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, isFeatured && styles.featuredTitle]} numberOfLines={2}>
              {course.course_title}
            </Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(course.status) }]}>
              <Text style={styles.badgeText}>{getStatusLabel(course.status)}</Text>
            </View>
          </View>

          {course.training_center_name && (
            <Text style={styles.center} numberOfLines={1}>
              {course.training_center_name}
            </Text>
          )}

          {variant === 'featured' && course.progress_percentage > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>التقدم</Text>
              <ProgressBar progress={course.progress_percentage} showLabel />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.stats}>
              {course.completed_lessons}/{course.total_lessons} درس
            </Text>
            <Text style={styles.date}>
              {formatDate(course.start_date)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return COLORS.primary;
    case 'completed':
      return COLORS.success;
    case 'pending':
      return '#F59E0B';
    default:
      return COLORS.secondary;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'قيد الانتظار';
    default:
      return status;
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  featuredCard: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.border,
  },
  featuredImage: {
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginEnd: 12,
  },
  featuredTitle: {
    fontSize: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  center: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});