'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LanguageCode, parseLanguageCode } from '@webzy/core';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

const STORAGE_KEY = 'webzy_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLanguageState(parseLanguageCode(saved));
      }
    } catch {
      // Ignore storage failures in strict privacy browsers.
    }
  }, []);

  function setLanguage(next: LanguageCode) {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === 'hi' ? 'hi' : 'en';
    } catch {
      // Ignore storage failures cleanly.
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
