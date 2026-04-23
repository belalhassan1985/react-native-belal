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
        name="completed"
        options={{
          title: 'المكتملة',
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