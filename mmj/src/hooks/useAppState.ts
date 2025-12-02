import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import type { Language } from '../types/common';

export interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentSessionId: number | string | null;
  setCurrentSessionId: (id: number | string | null) => void;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
}

export const useAppState = (): AppState => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return saved ? JSON.parse(saved) : true;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved === 'pl' || saved === 'en') ? saved : 'en';
  });

  const [currentSessionId, setCurrentSessionId] = useState<number | string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return saved ? (isNaN(Number(saved)) ? saved : Number(saved)) : null;
  });

  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, String(currentSessionId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }, [currentSessionId]);

  return {
    sidebarOpen,
    setSidebarOpen,
    language,
    setLanguage,
    currentSessionId,
    setCurrentSessionId,
    isInputFocused,
    setIsInputFocused,
  };
};

export default useAppState;
