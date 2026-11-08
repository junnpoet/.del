import '../src/global.css';
import React from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../src/services/queryClient';
import { QuickPublishFAB } from '../src/components/ui/QuickPublishFAB';

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
      </Stack>
      {/* Quick 3-click Publish Floating Action Button only on main tab views */}
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
      <RootContent />
    </PersistQueryClientProvider>
  );
}
