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
    ? 'bg-primary border-primary'
    : 'bg-neutral-surface border-neutral-border';

  const textActive = isActive
    ? 'text-white font-semibold'
    : 'text-neutral-textMain font-medium';

  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      activeOpacity={0.7}
      className={`min-h-[48px] min-w-[48px] flex-row items-center justify-center rounded-full border px-4 py-2 mr-2 mb-2 ${containerActive} ${className}`}
      {...props}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text className={`text-sm ${textActive}`}>{label}</Text>
    </TouchableOpacity>
  );
};
