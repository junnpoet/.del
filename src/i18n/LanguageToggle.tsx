import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Languages } from 'lucide-react-native';
import { LANGUAGE_LABELS, Language, useI18n } from './index';

const OPTIONS: Language[] = ['es', 'qu'];

/** Selector Español / Quechua (SPEC-04 §2.6). */
export function LanguageToggle({ large = false }: { large?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <View>
      <View className="flex-row items-center mb-2">
        <Languages size={large ? 22 : 18} color="#1E5E45" strokeWidth={2.2} />
        <Text
          className="text-neutral-textMain ml-2"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: large ? 18 : 15 }}
        >
          {t('language.label')}
        </Text>
      </View>
      <View className="flex-row bg-neutral-mutedBg p-1 rounded-2xl">
        {OPTIONS.map((option) => {
          const active = option === language;
          return (
            <TouchableOpacity
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setLanguage(option)}
              className={`flex-1 items-center justify-center rounded-xl ${
                large ? 'min-h-[56px]' : 'min-h-[42px]'
              } ${active ? 'bg-neutral-surface' : ''}`}
            >
              <Text
                className={active ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                style={{
                  fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                  fontSize: large ? 17 : 14,
                }}
              >
                {LANGUAGE_LABELS[option]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
