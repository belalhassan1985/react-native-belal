import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Loading } from '../src/components';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const routerRef = useRef(router);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        routerRef.current.replace('/(tabs)/profile');
      } else {
        routerRef.current.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return <Loading />;
}
