import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/services/auth';
import { isAccessibleModeEnabled } from '../src/features/accessible-mode/storage';

export default function RootIndex() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const routeInitialScreen = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        if (!isMounted) return;
        if (!hasSeenOnboarding) {
          router.replace('/(onboarding)/step1');
        } else if (!session) {
          router.replace('/(auth)/login');
        } else {
          // SPEC-04 §2.4: quien activó el Modo Accesible entra directo a la vista simple.
          const accessible = await isAccessibleModeEnabled();
          if (!isMounted) return;
          router.replace(accessible ? '/accessible' : '/(main)');
        }
      } catch (err) {
        console.error('Error routing initial screen', err);
        if (isMounted) router.replace('/(onboarding)/step1');
      }
    };

    routeInitialScreen();
    return () => {
      isMounted = false;
    };
  }, [loading, session, router]);

  return (
    <View className="flex-1 items-center justify-center bg-neutral-background">
      <ActivityIndicator size="large" color="#2D6A4F" />
    </View>
  );
}
