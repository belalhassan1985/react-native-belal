import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { TraineeCourse } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: TraineeCourse;
  onPress?: () => void;
  variant?: 'compact' | 'featured';
}

export function CourseCard({ course, onPress, variant = 'compact' }: CourseCardProps) {
  const isFeatured = variant === 'featured';
  
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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'pending': return '#F59E0B';
      default: return COLORS.secondary;
    }
  };

  console.log('[CourseCard] Rendering, courseId:', course?.id, 'has onPress:', !!onPress);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isFeatured && styles.featuredContainer,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.card}>
        {course?.course_image_url && (
          <Image
            source={{ uri: course.course_image_url }}
            style={[styles.image, isFeatured && styles.featuredImage]}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isFeatured && styles.featuredTitle]} numberOfLines={2}>
                {course?.course_title || 'بدون عنوان'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course?.status) }]}>
              <Text style={styles.statusText}>
                {getStatusLabel(course?.status)}
              </Text>
            </View>
          </View>

          {course?.training_center_name && (
            <Text style={styles.center} numberOfLines={1}>
              {course.training_center_name}
            </Text>
          )}

          {course?.course_description && (
            <Text style={styles.description} numberOfLines={2}>
              {course.course_description}
            </Text>
          )}

          {variant === 'featured' && (course?.progress_percentage ?? 0) > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>تقدمك في الدورة</Text>
                <Text style={styles.progressPercent}>
                  {course?.progress_percentage || 0}%
                </Text>
              </View>
              <ProgressBar 
                progress={course?.progress_percentage || 0} 
                showLabel={false}
                height={6}
              />
              <Text style={styles.progressDetail}>
                {course?.completed_lessons || 0} من {course?.total_lessons || 0} درس مكتمل
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>بدأ</Text>
              <Text style={styles.dateValue}>{formatDate(course?.start_date)}</Text>
            </View>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>متابعة</Text>
              <Text style={styles.ctaArrow}>←</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  featuredContainer: {
    marginBottom: SPACING.lg,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.surfaceLight,
  },
  featuredImage: {
    height: 140,
  },
  content: {
    padding: SPACING.md,
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
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  featuredTitle: {
    fontSize: FONT_SIZE.lg,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  center: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressDetail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginEnd: 4,
  },
  dateValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginEnd: 4,
  },
  ctaArrow: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
});