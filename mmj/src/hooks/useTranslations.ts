import { translations } from "../config/translations";

export const useTranslations = () => {
  return {
    t: translations.pl,
    language: 'pl' as const
  };
};
