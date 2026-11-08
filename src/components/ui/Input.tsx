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
    ? 'border-emergency-alert'
    : 'border-neutral-border focus:border-primary';

  return (
    <View className="mb-4 w-full">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-sm font-semibold text-neutral-textMain">
          {label}
        </Text>
        {onVoiceInput && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Dictar por voz"
            onPress={onVoiceInput}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`min-h-[36px] px-2 flex-row items-center rounded-md ${
              isVoiceRecording ? 'bg-emergency-alert' : 'bg-primary/10'
            }`}
          >
            <Mic
              size={16}
              color={isVoiceRecording ? '#FFFFFF' : '#2D6A4F'}
            />
            <Text
              className={`text-xs ml-1 font-medium ${
                isVoiceRecording ? 'text-white' : 'text-primary'
              }`}
            >
              {isVoiceRecording ? 'Grabando...' : 'Voz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        className={`flex-row items-center bg-neutral-surface border rounded-xl px-3 min-h-[48px] ${borderColor}`}
      >
        <TextInput
          placeholderTextColor="#9CA3AF"
          className={`flex-1 text-base text-neutral-textMain py-3 ${className}`}
          {...props}
        />
      </View>

      {error ? (
        <Text className="text-xs text-emergency-alert mt-1 font-medium">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-xs text-neutral-textMuted mt-1">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
