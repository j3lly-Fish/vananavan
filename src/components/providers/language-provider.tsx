'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMessages, type Locale } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  messages: any;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [messages, setMessages] = useState(getMessages('en'));

  useEffect(() => {
    // Load locale from localStorage or detect from browser
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale === 'en' || savedLocale === 'es') {
      setLocaleState(savedLocale);
      setMessages(getMessages(savedLocale));
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      const detectedLocale = browserLang.startsWith('es') ? 'es' : 'en';
      setLocaleState(detectedLocale);
      setMessages(getMessages(detectedLocale));
      localStorage.setItem('language', detectedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setMessages(getMessages(newLocale));
    localStorage.setItem('language', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, messages, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { messages } = useLanguage();

  return (key: string, params?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let text = getNestedValue(messages, fullKey);

    // Replace parameters like {count}
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }

    return text;
  };
}

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the key if path not found
    }
  }

  return typeof result === 'string' ? result : path;
}
