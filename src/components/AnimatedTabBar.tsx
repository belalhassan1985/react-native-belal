import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useNotifications } from '../hooks/useNotifications';
import { COLORS } from '../constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { unreadCount } = useNotifications();

  const getIcon = (routeName: string) => {
    switch (routeName) {
      case 'home':
        return '🏠';
      case 'courses':
        return '📚';
      case 'my-courses':
        return '📖';
      case 'join-requests':
        return '📋';
      case 'profile':
        return '👤';
      default:
        return '📱';
    }
  };

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const showBadge = route.name === 'home' && unreadCount > 0;

          return (
            <TabBarItem
              key={route.key}
              isFocused={isFocused}
              label={label as string}
              icon={getIcon(route.name)}
              showBadge={showBadge}
              unreadCount={unreadCount}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabBarItem({
  isFocused,
  label,
  icon,
  showBadge,
  unreadCount,
  options,
  onPress,
  onLongPress,
}: {
  isFocused: boolean;
  label: string;
  icon: string;
  showBadge: boolean;
  unreadCount: number;
  options: Record<string, unknown>;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isFocused ? 1 : 0.9, {
      damping: 15,
      stiffness: 150,
    });

    const translateY = withSpring(isFocused ? -4 : 0, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const rotate = withTiming('0deg', {
      duration: 300,
    });

    return {
      transform: [{ rotate }],
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isFocused ? 1 : 0.6, {
      duration: 200,
    });

    const scale = withSpring(isFocused ? 1 : 0.9, {
      damping: 15,
      stiffness: 150,
    });

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedTouchable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel as string}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabButton, animatedStyle]}
      activeOpacity={0.8}
    >
      <View style={[
        styles.tabButtonInner,
        isFocused && styles.tabButtonActive
      ]}>
        <View>
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Text style={[
              styles.icon,
              isFocused && styles.iconActive
            ]}>
              {icon}
            </Text>
          </Animated.View>
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Animated.Text
          style={[
            styles.label,
            isFocused && styles.labelActive,
            labelAnimatedStyle
          ]}
        >
          {label}
        </Animated.Text>
      </View>
      {isFocused && (
        <Animated.View
          style={styles.activeIndicator}
          entering={() => {
            'worklet';
            return {
              animations: {
                width: withSpring(40, { damping: 15 }),
                opacity: withTiming(1, { duration: 200 }),
              },
              initialValues: {
                width: 0,
                opacity: 0,
              },
            };
          }}
        />
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary + '15',
  },
  iconContainer: {
    marginBottom: 4,
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  iconActive: {
    fontSize: 26,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});