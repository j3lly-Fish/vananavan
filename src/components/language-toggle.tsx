'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { updateLanguagePreference } from '@/app/dashboard/driver/actions';
import type { Locale } from '@/lib/i18n';

interface LanguageToggleProps {
  userId?: string;
}

export function LanguageToggle({ userId }: LanguageToggleProps) {
  const { locale, setLocale } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLang: Locale) => {
    if (newLang === locale) return;

    setIsChanging(true);

    // Update context (which updates localStorage)
    setLocale(newLang);

    // Save to profile if user is logged in
    if (userId) {
      try {
        await updateLanguagePreference(newLang);
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }

    setIsChanging(false);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => handleLanguageChange('en')}
        disabled={isChanging}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          locale === 'en'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('es')}
        disabled={isChanging}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          locale === 'es'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        ES
      </button>
    </div>
  );
}
