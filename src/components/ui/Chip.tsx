import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  View,
} from 'react-native';

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  isActive = false,
  icon,
  className = '',
  ...props
}) => {
  const containerActive = isActive
    ? 'bg-neutral-textMain shadow-sm shadow-black/10'
    : 'bg-neutral-mutedBg';

  const textActive = isActive ? 'text-white' : 'text-neutral-textMuted';

  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      activeOpacity={0.8}
      className={`min-h-[40px] flex-row items-center justify-center rounded-2xl px-4 py-2 mr-2 mb-2 ${containerActive} ${className}`}
      {...props}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text
        className={textActive}
        style={{
          fontFamily: isActive ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_600SemiBold',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
