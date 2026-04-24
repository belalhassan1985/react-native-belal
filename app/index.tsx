import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Loading } from '../src/components';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isFirstLogin, hasSkippedFirstLoginReset, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (isFirstLogin && !hasSkippedFirstLoginReset) {
          router.replace('/reset-password?mode=first-login');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, isFirstLogin, hasSkippedFirstLoginReset, router]);

  return <Loading />;
}