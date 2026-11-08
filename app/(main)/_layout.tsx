import React from 'react';
import { Tabs } from 'expo-router';
import { Store, Users, User, AlertTriangle } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainLayout() {
  const router = useRouter();

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
            height: 64,
            paddingBottom: 8,
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
