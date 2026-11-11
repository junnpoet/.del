import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useI18n } from '../../../i18n';

const HOLD_MS = 2000;
const PULSE_MS = 120;

function vibrate(kind: 'pulse' | 'success' | 'cancel') {
  // expo-haptics no está disponible en web: se ignora sin romper el flujo.
  const run =
    kind === 'pulse'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      : kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  run.catch(() => undefined);
}

interface Props {
  label: string;
  hint: string;
  disabled?: boolean;
  onTrigger: () => void;
}

/**
 * Botón SOS gigante (SPEC-04 §2.4): ocupa ~50% de la pantalla y solo se dispara
 * tras mantenerlo presionado 2 segundos, con vibración continua mientras tanto
 * para evitar toques accidentales.
 */
export function SosHoldButton({ label, hint, disabled = false, onTrigger }: Props) {
  const { width, height } = useWindowDimensions();
  const { t } = useI18n();
  const size = Math.min(width * 0.82, height * 0.5, 420);
  const progress = useRef(new Animated.Value(0)).current;
  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [holding, setHolding] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(2);
  const startedAt = useRef(0);

  const stopPulse = () => {
    if (pulseTimer.current) clearInterval(pulseTimer.current);
    pulseTimer.current = null;
  };

  useEffect(() => stopPulse, []);

  const handlePressIn = () => {
    if (disabled) return;
    setHolding(true);
    setSecondsLeft(2);
    startedAt.current = Date.now();
    vibrate('pulse');
    pulseTimer.current = setInterval(() => {
      vibrate('pulse');
      const remaining = Math.max(0, HOLD_MS - (Date.now() - startedAt.current));
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, PULSE_MS);

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      stopPulse();
      setHolding(false);
      if (finished) {
        vibrate('success');
        onTrigger();
      }
      progress.setValue(0);
    });
  };

  const handlePressOut = () => {
    if (!holding) return;
    progress.stopAnimation();
    stopPulse();
    setHolding(false);
    if (Date.now() - startedAt.current < HOLD_MS) vibrate('cancel');
  };

  const fillHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [0, size] });

  return (
    <View className="items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${hint}`}
        accessibilityHint={t('sos.a11yHint')}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
        className={`items-center justify-center ${disabled ? 'bg-neutral-textLight' : 'bg-emergency-alert'}`}
      >
        {/* Relleno que sube mientras se mantiene presionado */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: fillHeight,
            backgroundColor: '#7F1D1D',
          }}
        />
        <Text className="text-white text-center" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: size * 0.2 }}>
          {label}
        </Text>
        <Text className="text-white text-center px-6 mt-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }}>
          {holding ? t('sos.holding', { n: secondsLeft }) : hint}
        </Text>
      </Pressable>
    </View>
  );
}
