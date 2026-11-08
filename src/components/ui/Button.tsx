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
    'flex-row items-center justify-center rounded-2xl px-6';
  const sizeStyles = isAccessible ? 'min-h-[70px] py-4' : 'min-h-[58px] py-3.5';

  let variantStyles = 'bg-primary border-2 border-primary-dark/20';
  let textStyles = 'text-white';
  let spinnerColor = '#FFFFFF';

  if (variant === 'secondary') {
    variantStyles = 'bg-earth-pastel border-2 border-earth';
    textStyles = 'text-earth-dark';
    spinnerColor = '#6D3B1E';
  } else if (variant === 'outline') {
    variantStyles = 'bg-primary-pastel/70 border-2 border-primary';
    textStyles = 'text-primary-dark';
    spinnerColor = '#1B4332';
  } else if (variant === 'emergency') {
    variantStyles = 'bg-emergency-alert border-2 border-white/20';
    textStyles = 'text-white tracking-wide';
    spinnerColor = '#FFFFFF';
  }

  const disabledStyles = disabled || isLoading ? 'opacity-50' : '';
  const fontSize = isAccessible ? 22 : 19;

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
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2.5">{icon}</View>}
          <Text
            className={`${textStyles} text-center`}
            style={{
              fontFamily: 'Nunito_800ExtraBold',
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
