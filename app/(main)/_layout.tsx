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
          tabBarActiveTintColor: '#1B4332',
          tabBarInactiveTintColor: '#7A7267',
          tabBarStyle: {
            backgroundColor: '#FFFDF9',
            borderTopColor: '#E6DEC8',
            borderTopWidth: 2,
            height: 68 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: 'Nunito_800ExtraBold',
            fontSize: 14,
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
              <Store size={26} color={color} strokeWidth={focused ? 2.8 : 2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Comunidad',
            tabBarLabel: 'Muro Barrial',
            tabBarIcon: ({ color, focused }) => (
              <Users size={26} color={color} strokeWidth={focused ? 2.8 : 2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Hogar',
            tabBarLabel: 'Mi Perfil',
            tabBarIcon: ({ color, focused }) => (
              <User size={26} color={color} strokeWidth={focused ? 2.8 : 2.2} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
