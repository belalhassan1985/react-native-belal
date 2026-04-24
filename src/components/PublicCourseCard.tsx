import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { Course } from '../types';
import { COLORS } from '../constants';

interface PublicCourseCardProps {
  course: Course;
  onPress?: () => void;
}

export function PublicCourseCard({ course, onPress }: PublicCourseCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} padding={0}>
        {course.image_url && (
          <Image
            source={{ uri: course.image_url }}
            style={styles.image}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {course.name}
          </Text>
          {course.training_center_name && (
            <Text style={styles.center} numberOfLines={1}>
              {course.training_center_name}
            </Text>
          )}
          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>يبدأ</Text>
              <Text style={styles.date}>{formatDate(course.start_date)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.course_status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(course.course_status)}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getStatusColor(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return COLORS.success;
    case 'pending':
      return '#F59E0B';
    case 'expired':
      return COLORS.secondary;
    default:
      return COLORS.border;
  }
}

function getStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'approved':
      return 'متاح';
    case 'pending':
      return 'قيد الانتظار';
    case 'expired':
      return 'منتهي';
    default:
      return status || 'غير محدد';
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
  image: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.border,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  center: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginEnd: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});