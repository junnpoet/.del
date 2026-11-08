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
    <View className="mb-5 w-full">
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-neutral-textMain"
          style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
        >
          {label}
        </Text>
        {onVoiceInput && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Dictar por voz"
            onPress={onVoiceInput}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className={`min-h-[42px] px-3.5 flex-row items-center rounded-xl border ${
              isVoiceRecording
                ? 'bg-emergency-alert border-emergency-alert'
                : 'bg-primary-pastel border-primary-light/50'
            }`}
          >
            <Mic
              size={18}
              color={isVoiceRecording ? '#FFFFFF' : '#1B4332'}
            />
            <Text
              className={`ml-1.5 ${
                isVoiceRecording ? 'text-white' : 'text-primary-dark'
              }`}
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}
            >
              {isVoiceRecording ? 'Grabando...' : 'Voz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        className={`flex-row items-center bg-neutral-surface border-2 rounded-2xl px-4 min-h-[56px] ${borderColor}`}
      >
        <TextInput
          placeholderTextColor="#8C857B"
          className={`flex-1 text-neutral-textMain py-3.5 ${className}`}
          style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 17 }}
          {...props}
        />
      </View>

      {error ? (
        <Text
          className="text-emergency-alert mt-1.5"
          style={{ fontFamily: 'Nunito_700Bold', fontSize: 15 }}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          className="text-neutral-textMuted mt-1.5"
          style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};
