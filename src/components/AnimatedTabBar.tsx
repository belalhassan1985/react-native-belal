import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
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
            const rotate = withTiming(isFocused ? '0deg' : '0deg', {
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

          const getIcon = (routeName: string) => {
            switch (routeName) {
              case 'home':
                return '🏠';
              case 'completed':
                return '🎓';
              case 'profile':
                return '👤';
              default:
                return '📱';
            }
          };

          return (
            <AnimatedTouchable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, animatedStyle]}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabButtonInner,
                isFocused && styles.tabButtonActive
              ]}>
                <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                  <Text style={[
                    styles.icon,
                    isFocused && styles.iconActive
                  ]}>
                    {getIcon(route.name)}
                  </Text>
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                    labelAnimatedStyle
                  ]}
                >
                  {label as string}
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
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    backgroundColor: '#EEF2FF',
  },
  iconContainer: {
    marginBottom: 4,
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
    color: '#9CA3AF',
    textAlign: 'center',
  },
  labelActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});
