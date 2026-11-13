import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  View,
  type DimensionValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  maxHeight?: DimensionValue;
  backdropColor?: string;
  children: React.ReactNode;
}

/**
 * Shared bottom-sheet modal with a fast backdrop fade and a snappy sheet slide
 * that clears the full measured height and respects bottom system insets.
 */
export function BottomSheetModal({
  visible,
  onClose,
  maxHeight = '85%',
  backdropColor = 'rgba(0,0,0,0.4)',
  children,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(visible);
  const sheetHeightRef = useRef(560);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(592)).current;

  useEffect(() => {
    const offscreen = sheetHeightRef.current + 32;

    if (visible) {
      setRendered(true);
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(offscreen);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 170,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!rendered) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: offscreen,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [visible, rendered, backdropOpacity, sheetTranslateY]);

  if (!rendered) return null;

  return (
    <Modal
      transparent
      visible={rendered}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: backdropColor,
            opacity: backdropOpacity,
          }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0) sheetHeightRef.current = h;
          }}
          style={{
            transform: [{ translateY: sheetTranslateY }],
            maxHeight,
          }}
        >
          <View
            className="rounded-t-3xl bg-neutral-surface px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom + 16, 28) }}
          >
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
