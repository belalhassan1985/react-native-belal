import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 6,
  showLabel = false,
  variant = 'default',
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const fillColor = variant === 'success' ? COLORS.success : variant === 'warning' ? COLORS.warning : COLORS.primary;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height,
              borderRadius: height / 2,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {},
  label: {
    marginStart: SPACING.sm,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});