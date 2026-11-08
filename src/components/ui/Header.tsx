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
    ? 'bg-emergency-background border-b border-emergency-alert/40'
    : 'bg-neutral-surface border-b border-neutral-border';

  const titleStyles = isEmergency
    ? 'text-white font-bold'
    : 'text-neutral-textMain font-bold';

  const subtitleStyles = isEmergency
    ? 'text-emergency-warning font-medium'
    : 'text-neutral-textMuted';

  return (
    <View
      className={`px-4 pb-3 ${bgStyles}`}
      style={{ paddingTop: Math.max(insets.top + 8, 16) }}
    >
      <View className="flex-row items-center justify-between min-h-[48px]">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Regresar"
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="min-h-[48px] min-w-[48px] items-center justify-center -ml-2 mr-2"
            >
              <ChevronLeft
                size={28}
                color={isEmergency ? '#FFFFFF' : '#1F2937'}
              />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text className={`text-xl ${titleStyles}`} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text className={`text-xs ${subtitleStyles}`} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View className="ml-2">{rightAction}</View>}
      </View>
    </View>
  );
};
