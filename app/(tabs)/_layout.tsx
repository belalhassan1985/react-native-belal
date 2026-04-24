import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '../../src/components/AnimatedTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'الرئيسية',
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'الدورات',
        }}
      />
      <Tabs.Screen
        name="my-courses"
        options={{
          title: 'دوراتي',
        }}
      />
      <Tabs.Screen
        name="join-requests"
        options={{
          title: 'طلباتي',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
        }}
      />
    </Tabs>
  );
}