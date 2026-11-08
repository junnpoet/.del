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
    ? 'bg-primary border-2 border-primary-dark'
    : 'bg-neutral-mutedBg border-2 border-neutral-border';

  const textActive = isActive ? 'text-white' : 'text-neutral-textMain';

  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      activeOpacity={0.75}
      className={`min-h-[50px] min-w-[56px] flex-row items-center justify-center rounded-full px-5 py-2.5 mr-2.5 mb-2.5 ${containerActive} ${className}`}
      {...props}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text
        className={textActive}
        style={{
          fontFamily: isActive ? 'Nunito_800ExtraBold' : 'Nunito_700Bold',
          fontSize: 16,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
