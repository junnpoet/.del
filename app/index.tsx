import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const routeInitialScreen = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        if (!isMounted) return;

        if (!hasSeenOnboarding) {
          router.replace('/(onboarding)/step1');
        } else {
          router.replace('/(main)');
        }
      } catch (err) {
        console.error('Error routing initial screen', err);
        if (isMounted) {
          router.replace('/(onboarding)/step1');
        }
      }
    };

    routeInitialScreen();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-neutral-background">
      <ActivityIndicator size="large" color="#2D6A4F" />
    </View>
  );
}
