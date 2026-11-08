import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Mic } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  onVoiceInput?: () => void;
  isVoiceRecording?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  onVoiceInput,
  isVoiceRecording = false,
  className = '',
  ...props
}) => {
  const borderColor = error
    ? 'border border-emergency-alert'
    : 'border border-neutral-border/80 focus:border-primary';

  return (
    <View className="mb-4 w-full">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text
          className="text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
        >
          {label}
        </Text>
        {onVoiceInput && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Dictar por voz"
            onPress={onVoiceInput}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`min-h-[34px] px-3 flex-row items-center rounded-xl ${
              isVoiceRecording
                ? 'bg-emergency-alert'
                : 'bg-neutral-mutedBg'
            }`}
          >
            <Mic
              size={15}
              color={isVoiceRecording ? '#FFFFFF' : '#1A1D20'}
            />
            <Text
              className={`ml-1 ${
                isVoiceRecording ? 'text-white' : 'text-neutral-textMain'
              }`}
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {isVoiceRecording ? 'Grabando...' : 'Voz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        className={`flex-row items-center bg-neutral-surface rounded-2xl px-4 min-h-[48px] ${borderColor}`}
      >
        <TextInput
          placeholderTextColor="#9EA3AE"
          className={`flex-1 text-neutral-textMain py-2.5 ${className}`}
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15 }}
          {...props}
        />
      </View>

      {error ? (
        <Text
          className="text-emergency-alert mt-1"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          className="text-neutral-textMuted mt-1"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
