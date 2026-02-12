'use client';

import { useState, useEffect } from 'react';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { useLanguage } from '@/components/providers/language-provider';

interface TranslatableRouteNameProps {
  name: string;
  originalLanguage?: string;
  className?: string;
}

/**
 * Component that automatically translates route names/descriptions
 * Usage: <TranslatableRouteName name={route.name} originalLanguage="en" />
 */
export function TranslatableRouteName({ name, originalLanguage = 'en', className = '' }: TranslatableRouteNameProps) {
  const { locale } = useLanguage();
  const { translateText, isTranslating } = useContentTranslation();
  const [translatedName, setTranslatedName] = useState(name);

  useEffect(() => {
    if (locale !== originalLanguage && name) {
      translateText(name, originalLanguage).then(setTranslatedName);
    } else {
      setTranslatedName(name);
    }
  }, [locale, name, originalLanguage, translateText]);

  if (isTranslating) {
    return (
      <span className={`inline-block animate-pulse ${className}`}>
        <span className="bg-slate-200 dark:bg-slate-700 rounded px-2 py-1">...</span>
      </span>
    );
  }

  return <span className={className}>{translatedName}</span>;
}
