import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'emergency';
export type ButtonSize = 'default' | 'accessible';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const isAccessible = size === 'accessible';

  const baseContainerStyles =
    'flex-row items-center justify-center rounded-2xl px-5';
  const sizeStyles = isAccessible ? 'min-h-[60px] py-3.5' : 'min-h-[50px] py-3';

  let variantStyles = 'bg-primary shadow-sm shadow-black/10';
  let textStyles = 'text-white';
  let spinnerColor = '#FFFFFF';

  if (variant === 'secondary') {
    variantStyles = 'bg-neutral-mutedBg';
    textStyles = 'text-neutral-textMain';
    spinnerColor = '#1A1D20';
  } else if (variant === 'outline') {
    variantStyles = 'bg-neutral-surface border border-neutral-border';
    textStyles = 'text-neutral-textMain';
    spinnerColor = '#1A1D20';
  } else if (variant === 'emergency') {
    variantStyles = 'bg-emergency-alert shadow-sm shadow-black/10';
    textStyles = 'text-white';
    spinnerColor = '#FFFFFF';
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50' : '';
  const fontSize = isAccessible ? 18 : 15;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      className={`${baseContainerStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`${textStyles} text-center`}
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
