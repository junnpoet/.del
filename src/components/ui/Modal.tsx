import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 justify-end sm:justify-center p-4">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-neutral-surface rounded-3xl p-5 shadow-xl max-h-[85%] border border-neutral-border">
              <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border">
                <Text className="text-lg font-bold text-neutral-textMain flex-1">
                  {title}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar modal"
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="min-h-[48px] min-w-[48px] items-center justify-center -mr-2"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="mt-4">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};
