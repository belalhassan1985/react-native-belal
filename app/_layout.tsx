import { Stack } from 'expo-router';
import { I18nProvider } from '../src/i18n/I18nProvider';
import { NotificationProvider } from '../src/hooks/useNotifications';
import { AuthProvider } from '../src/hooks/useAuth';

export default function RootLayout() {
  return (
    <I18nProvider>
      <NotificationProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen
              name="login"
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="index"
              options={{
                animation: 'none',
              }}
            />
            <Stack.Screen
              name="course/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="lesson/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="reset-password"
              options={{
                animation: 'fade',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="training-center/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="lecture/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
          </Stack>
        </AuthProvider>
      </NotificationProvider>
    </I18nProvider>
  );
}