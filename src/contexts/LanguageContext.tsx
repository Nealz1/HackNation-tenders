import { createContext, ReactNode } from 'react';
import { translations } from '../config/translations';

type TranslationsType = typeof translations.pl;

interface LanguageContextType {
  t: TranslationsType;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const t = translations.pl as TranslationsType;

  const value: LanguageContextType = { t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
