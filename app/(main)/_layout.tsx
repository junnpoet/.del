import React from 'react';
import { Tabs } from 'expo-router';
import { Store, Users, User, Newspaper } from 'lucide-react-native';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { useZoneEmergency } from '../../src/features/emergency/hooks/useEmergencyRealtime';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { zoneEmergency } = useZoneEmergency();
  const isEmergency = Boolean(zoneEmergency);
  const TAB_ITEM_HEIGHT = 50;
  const TAB_VERTICAL_GAP = 6;
  const bottomInset = insets.bottom;
  const bottomPadding = bottomInset + TAB_VERTICAL_GAP;

  return (
    <View className={`flex-1 ${isEmergency ? 'bg-[#FFF7F7]' : 'bg-neutral-background'}`}>
      <Tabs
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isEmergency ? '#B91C1C' : '#1A1D20',
          tabBarInactiveTintColor: isEmergency ? '#9F6B70' : '#9EA3AE',
          tabBarStyle: {
            backgroundColor: isEmergency ? '#FFF1F2' : '#FFFFFF',
            borderTopColor: isEmergency ? '#FECDD3' : '#F0F2F5',
            borderTopWidth: 1,
            height: TAB_ITEM_HEIGHT + TAB_VERTICAL_GAP * 2 + bottomInset,
            paddingBottom: bottomPadding,
            paddingTop: TAB_VERTICAL_GAP,
            paddingHorizontal: 6,
          },
          tabBarItemStyle: {
            flex: 1,
            height: TAB_ITEM_HEIGHT,
            marginHorizontal: 3,
            overflow: 'hidden',
            borderRadius: 16,
          },
          tabBarButton: ({ ref, ...props }) => (
            <Pressable
              {...(props as any)}
              android_ripple={{
                color: isEmergency ? 'rgba(185, 28, 28, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderless: false,
              }}
              style={[
                props.style,
                {
                  flex: 1,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: TAB_ITEM_HEIGHT,
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
            title: t('tabs.directoryTitle'),
            tabBarLabel: t('tabs.directory'),
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
            title: t('tabs.news'),
            tabBarLabel: t('tabs.news'),
            tabBarIcon: ({ color, focused }) => (
              <Newspaper size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: t('tabs.community'),
            tabBarLabel: t('tabs.community'),
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
            title: t('tabs.profileTitle'),
            tabBarLabel: t('tabs.profile'),
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
