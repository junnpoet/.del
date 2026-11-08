import React from 'react';
import { Tabs } from 'expo-router';
import { Store, Users, User, Newspaper } from 'lucide-react-native';
import { View, Pressable, Platform } from 'react-native';
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
          tabBarItemStyle: {
            flex: 1,
            height: 50,
            overflow: 'hidden',
            borderRadius: 16,
          },
          tabBarButton: ({ ref, ...props }) => (
            <Pressable
              {...(props as any)}
              android_ripple={{
                color: 'rgba(0, 0, 0, 0.05)',
                borderless: false,
              }}
              style={({ pressed }) => [
                props.style,
                {
                  flex: 1,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  height: 48,
                  overflow: 'hidden',
                  borderRadius: 16,
                },
              ]}
            />
          ),
          tabBarIconStyle: {
            alignSelf: 'center',
          },
          tabBarLabelStyle: {
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 11,
            marginTop: 2,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Oficios',
            tabBarLabel: 'Directorio',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Store size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              </View>
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
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Hogar',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
