import { createContext, ReactNode } from 'react';
import { translations, Language } from '../config/translations';

type TranslationsType = (typeof translations)[Language];

interface LanguageContextType {
  language: Language;
  t: TranslationsType;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const language: Language = 'pl';
  const t = translations[language] as TranslationsType;

  const value: LanguageContextType = {
    language,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
