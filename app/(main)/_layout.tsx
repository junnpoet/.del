import React from 'react';
import { Tabs } from 'expo-router';
import { Store, Users, User } from 'lucide-react-native';
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
          tabBarActiveTintColor: '#2D6A4F',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            height: 58 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Oficios',
            tabBarLabel: 'Directorio',
            tabBarIcon: ({ color, size }) => <Store size={size || 24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Comunidad',
            tabBarLabel: 'Muro Barrial',
            tabBarIcon: ({ color, size }) => <Users size={size || 24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Hogar',
            tabBarLabel: 'Mi Perfil',
            tabBarIcon: ({ color, size }) => <User size={size || 24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
