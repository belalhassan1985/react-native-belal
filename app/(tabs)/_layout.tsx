import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
