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
    'flex-row items-center justify-center rounded-xl px-4';
  const sizeStyles = isAccessible ? 'min-h-[64px] py-4' : 'min-h-[48px] py-3';

  let variantStyles = 'bg-primary active:bg-primary-dark';
  let textStyles = 'text-white font-semibold';

  if (variant === 'secondary') {
    variantStyles = 'bg-earth active:bg-earth-dark';
    textStyles = 'text-white font-semibold';
  } else if (variant === 'outline') {
    variantStyles =
      'bg-transparent border-2 border-primary active:bg-primary/10';
    textStyles = 'text-primary font-semibold';
  } else if (variant === 'emergency') {
    variantStyles = 'bg-emergency-alert active:opacity-90';
    textStyles = 'text-white font-bold tracking-wide';
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50' : '';
  const fontSize = isAccessible ? 'text-xl' : 'text-base';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      className={`${baseContainerStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#2D6A4F' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${fontSize} ${textStyles} text-center`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
