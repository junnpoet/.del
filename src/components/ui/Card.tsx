import React from 'react';
import { View, ViewProps } from 'react-native';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'muted'
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
  let variantStyles = 'bg-neutral-surface shadow-sm shadow-black/5';

  if (variant === 'elevated') {
    variantStyles = 'bg-neutral-surface shadow-md shadow-black/8';
  } else if (variant === 'muted') {
    variantStyles = 'bg-neutral-mutedBg';
  } else if (variant === 'emergency') {
    variantStyles = 'bg-emergency-cardDark';
  }

  return (
    <View
      className={`rounded-3xl p-4 ${variantStyles} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
