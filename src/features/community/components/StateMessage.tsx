import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface Props {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

/** Tarjeta para estados vacíos, de error o de acceso restringido. */
export function StateMessage({ icon, title, message, actionLabel, onAction, loading }: Props) {
  return (
    <Card className="p-6 items-center">
      {loading ? (
        <ActivityIndicator size="large" color="#1E5E45" />
      ) : icon ? (
        <View className="w-16 h-16 rounded-full bg-neutral-mutedBg items-center justify-center mb-4">{icon}</View>
      ) : null}
      <Text
        className="text-neutral-textMain text-center mt-1"
        style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
      >
        {title}
      </Text>
      {message ? (
        <Text
          className="text-neutral-textMuted text-center leading-5 mt-2"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} className="w-full mt-5" />
      ) : null}
    </Card>
  );
}
