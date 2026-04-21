import { Stack } from 'expo-router';
import { AuthProvider } from '../src/hooks/useAuth';
import { I18nProvider } from '../src/hooks/useI18n';

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}
