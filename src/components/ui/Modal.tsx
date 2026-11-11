import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
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
            <View className="bg-neutral-surface rounded-3xl p-5 shadow-xl max-h-[88%]">
              <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border/60">
                <Text
                  className="text-neutral-textMain flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('common.closeModal')}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="h-9 w-9 rounded-full bg-neutral-mutedBg items-center justify-center"
                >
                  <X size={18} color="#6C727A" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <View className="mt-3">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};
