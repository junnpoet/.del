import '../src/global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../src/services/queryClient';
import { QuickPublishFAB } from '../src/components/ui/QuickPublishFAB';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        const inOnboardingGroup = segments[0] === '(onboarding)';

        if (!hasSeenOnboarding && !inOnboardingGroup) {
          router.replace('/(onboarding)');
        }
      } catch (err) {
        console.error('Error reading onboarding status', err);
      } finally {
        setIsReady(true);
      }
    };

    checkInitialRoute();
  }, [segments, router]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-background">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  const isMainTab = segments[0] === '(main)';

  return (
    <View className="flex-1 bg-neutral-background">
      {children}
      {/* Floating Action Button only shown on main screens */}
      {isMainTab && <QuickPublishFAB />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <NavigationGuard>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen
            name="emergency-board"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />
        </Stack>
      </NavigationGuard>
    </PersistQueryClientProvider>
  );
}
