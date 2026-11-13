import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Languages, Check } from 'lucide-react-native';
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
              className={`flex-1 items-center justify-center px-2 py-1.5 rounded-xl ${
                large ? 'min-h-[56px]' : 'min-h-[42px]'
              } ${active ? 'bg-neutral-surface' : ''}`}
            >
              <Text
                className={`text-center ${active ? 'text-neutral-textMain' : 'text-neutral-textMuted'}`}
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

/** Botón circular flotante con selector desplegable Español / Quechua. */
export function LanguageMenuButton() {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('language.label')}
        onPress={() => setOpen((prev) => !prev)}
        className="w-11 h-11 rounded-full bg-neutral-surface border border-neutral-border/80 items-center justify-center shadow-sm"
      >
        <Languages size={20} color="#1E5E45" strokeWidth={2.2} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/15 pt-16 pr-5 items-end"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="w-52 bg-neutral-surface rounded-2xl border border-neutral-border/80 p-2 shadow-lg"
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              className="text-neutral-textMuted px-3 pt-1.5 pb-2 uppercase tracking-wider"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
            >
              {t('language.label')}
            </Text>
            {OPTIONS.map((option) => {
              const active = option === language;
              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setLanguage(option);
                    setOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-3 py-3 rounded-xl ${
                    active ? 'bg-primary/10' : ''
                  }`}
                >
                  <Text
                    className={active ? 'text-primary' : 'text-neutral-textMain'}
                    style={{
                      fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                      fontSize: 14,
                    }}
                  >
                    {LANGUAGE_LABELS[option]}
                  </Text>
                  {active && <Check size={16} color="#1E5E45" strokeWidth={2.4} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
