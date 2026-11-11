import '../src/global.css';
import React from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { queryClient, asyncStoragePersister } from '../src/services/queryClient';
import { QuickPublishFAB } from '../src/components/ui/QuickPublishFAB';
import { DemoProvider } from '../src/services/demoStore';
import { AuthProvider } from '../src/services/auth';
import { LanguageProvider } from '../src/i18n';

function RootContent() {
  const segments = useSegments();
  const isMainTab = segments[0] === '(main)';

  return (
    <View className="flex-1 bg-neutral-background">
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
        <Stack.Screen name="care-network" options={{ headerShown: false }} />
        <Stack.Screen name="leader-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="accessible" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      {/* Quick 3-click Publish Floating Action Button only on main tab views */}
      {isMainTab && <QuickPublishFAB />}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#1E5E45" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <AuthProvider>
          <LanguageProvider>
            <DemoProvider>
              <RootContent />
            </DemoProvider>
          </LanguageProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
