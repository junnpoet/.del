import React from 'react';
import { Tabs } from 'expo-router';
import { Store, Users, User, Newspaper } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View className="flex-1 bg-neutral-background">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1A1D20',
          tabBarInactiveTintColor: '#9EA3AE',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F2F5',
            borderTopWidth: 1,
            height: 56 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 11,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Oficios',
            tabBarLabel: 'Directorio',
            tabBarIcon: ({ color, focused }) => (
              <Store size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'Noticias',
            tabBarLabel: 'Noticias',
            tabBarIcon: ({ color, focused }) => (
              <Newspaper size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Comunidad',
            tabBarLabel: 'Comunidad',
            tabBarIcon: ({ color, focused }) => (
              <Users size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Hogar',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
