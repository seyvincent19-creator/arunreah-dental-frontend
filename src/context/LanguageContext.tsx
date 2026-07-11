import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { dictionary } from '../i18n/dictionary';
import type { Language, TranslationKey } from '../i18n/dictionary';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LANGUAGE_STORAGE_KEY = 'arunreah_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language) || 'en',
  );

  const setLanguage = (next: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    setLanguageState(next);
  };

  const t = useMemo(() => {
    return (key: TranslationKey) => dictionary[language][key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
