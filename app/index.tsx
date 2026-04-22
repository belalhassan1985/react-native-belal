import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Loading } from '../src/components';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index: isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Index: Redirecting to /(tabs)/home');
        router.replace('/(tabs)/home');
      } else {
        console.log('Index: Redirecting to /login');
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return <Loading />;
}