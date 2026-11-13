import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../i18n';
import { useZoneEmergency } from '../../features/emergency/hooks/useEmergencyRealtime';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  isEmergency?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  onBack,
  rightAction,
  isEmergency = false,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { zoneEmergency } = useZoneEmergency();
  const effectiveEmergency = isEmergency || Boolean(zoneEmergency);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const bgStyles = effectiveEmergency
    ? 'bg-[#FFF1F2] border-b border-red-200'
    : 'bg-neutral-surface border-b border-neutral-border/60';

  const titleStyles = effectiveEmergency ? 'text-[#7F1D1D]' : 'text-neutral-textMain';
  const subtitleStyles = effectiveEmergency
    ? 'text-[#B91C1C]'
    : 'text-neutral-textMuted';

  return (
    <View
      className={`px-5 pb-3 ${bgStyles}`}
      style={{ paddingTop: Math.max(insets.top + 8, 16) }}
    >
      <View className="flex-row items-center justify-between min-h-[48px]">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`h-10 w-10 rounded-2xl items-center justify-center mr-3 ${
                effectiveEmergency ? 'bg-red-100' : 'bg-neutral-mutedBg'
              }`}
            >
              <ChevronLeft
                size={22}
                strokeWidth={2.2}
                color={effectiveEmergency ? '#991B1B' : '#1A1D20'}
              />
            </TouchableOpacity>
          )}

          {showLogo && (
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: 36, height: 36, borderRadius: 10, marginRight: 10 }}
              resizeMode="contain"
            />
          )}

          <View className="flex-1">
            <Text
              className={titleStyles}
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22 }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className={`mt-0.5 ${subtitleStyles}`}
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View className="ml-3">{rightAction}</View>}
      </View>

      {zoneEmergency && (
        <View className="mt-1.5 flex-row items-center rounded-xl bg-red-600 px-2.5 py-1 self-start">
          <AlertTriangle size={12} color="#FFFFFF" />
          <Text
            className="ml-1.5 uppercase tracking-wider text-white"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 10.5 }}
          >
            Modo Emergencia · {zoneEmergency.event_type}
          </Text>
        </View>
      )}
    </View>
  );
};
