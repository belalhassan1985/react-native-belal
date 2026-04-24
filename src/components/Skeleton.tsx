import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { COLORS } from '../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as DimensionValue, height, borderRadius },
        style,
      ]}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <Skeleton height={120} borderRadius={12} />
      <View style={styles.content}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
});