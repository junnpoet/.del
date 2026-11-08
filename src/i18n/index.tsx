import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Language,
  TranslationKey,
  TranslationParams,
  translate,
  translateCategory,
} from './translations';

export * from './translations';

const LANGUAGE_KEY = '@sumayni_language';

// Idioma activo accesible fuera de React (utilidades, mensajes de error de hooks).
let activeLanguage: Language = 'es';

/** Traduce con el idioma activo. Para código que no es un componente. */
export function tr(key: TranslationKey, params?: TranslationParams): string {
  return translate(activeLanguage, key, params);
}

export function trCategory(category: string): string {
  return translateCategory(activeLanguage, category);
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  tCategory: (category: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((saved) => {
        if (saved === 'es' || saved === 'qu') {
          activeLanguage = saved;
          setLanguageState(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    activeLanguage = next;
    setLanguageState(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language]
  );
  const tCategory = useCallback((category: string) => translateCategory(language, category), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, tCategory }),
    [language, setLanguage, t, tCategory]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de <LanguageProvider>');
  return ctx;
}
