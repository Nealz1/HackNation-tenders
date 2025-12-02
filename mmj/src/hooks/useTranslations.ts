import { translations, Language } from "../config/translations";

export const useTranslations = (language: Language) => {
  return translations[language];
};
