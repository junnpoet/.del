import React from 'react';
import { View, ViewProps } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'emergency';

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
  let variantStyles = 'bg-neutral-card border border-neutral-border';

  if (variant === 'elevated') {
    variantStyles =
      'bg-neutral-card shadow-sm border border-neutral-border/60';
  } else if (variant === 'emergency') {
    variantStyles =
      'bg-emergency-cardDark border-2 border-emergency-alert';
  }

  return (
    <View
      className={`rounded-2xl p-4 ${variantStyles} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
