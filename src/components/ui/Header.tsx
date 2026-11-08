import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  isEmergency?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  isEmergency = false,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const bgStyles = isEmergency
    ? 'bg-emergency-background border-b-2 border-emergency-alert/40'
    : 'bg-neutral-surface border-b-2 border-neutral-border';

  const titleStyles = isEmergency ? 'text-white' : 'text-neutral-textMain';
  const subtitleStyles = isEmergency
    ? 'text-emergency-warning'
    : 'text-neutral-textMuted';

  return (
    <View
      className={`px-5 pb-4 ${bgStyles}`}
      style={{ paddingTop: Math.max(insets.top + 10, 18) }}
    >
      <View className="flex-row items-center justify-between min-h-[54px]">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Regresar"
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`h-12 w-12 rounded-2xl items-center justify-center mr-3 ${
                isEmergency ? 'bg-white/15' : 'bg-primary-pastel'
              }`}
            >
              <ChevronLeft
                size={28}
                strokeWidth={2.5}
                color={isEmergency ? '#FFFFFF' : '#1B4332'}
              />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text
              className={titleStyles}
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 23 }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className={`mt-0.5 ${subtitleStyles}`}
                style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View className="ml-3">{rightAction}</View>}
      </View>
    </View>
  );
};
