import React from 'react';
import { View, ViewProps } from 'react-native';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'pastel-sage'
  | 'pastel-earth'
  | 'emergency';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  style,
  ...props
}) => {
  let variantStyles = 'bg-neutral-card border-2 border-neutral-border';

  if (variant === 'elevated') {
    variantStyles = 'bg-neutral-card shadow-sm border-2 border-neutral-border';
  } else if (variant === 'pastel-sage') {
    variantStyles = 'bg-primary-pastel border-2 border-primary-soft';
  } else if (variant === 'pastel-earth') {
    variantStyles = 'bg-earth-pastel border-2 border-earth-soft';
  } else if (variant === 'emergency') {
    variantStyles = 'bg-emergency-cardDark border-2 border-emergency-alert';
  }

  return (
    <View
      className={`rounded-3xl p-5 ${variantStyles} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
