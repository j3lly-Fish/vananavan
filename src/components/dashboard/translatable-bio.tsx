'use client';

import { useState, useEffect } from 'react';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { useLanguage } from '@/components/providers/language-provider';

interface TranslatableBioProps {
  bio: string;
  originalLanguage?: string;
  className?: string;
}

/**
 * Component that automatically translates driver bio based on current language
 * Usage: <TranslatableBio bio={driverBio} originalLanguage="en" />
 */
export function TranslatableBio({ bio, originalLanguage = 'en', className = '' }: TranslatableBioProps) {
  const { locale } = useLanguage();
  const { translateText, isTranslating } = useContentTranslation();
  const [translatedBio, setTranslatedBio] = useState(bio);

  useEffect(() => {
    // Only translate if target language differs from original
    if (locale !== originalLanguage && bio) {
      translateText(bio, originalLanguage).then(setTranslatedBio);
    } else {
      setTranslatedBio(bio);
    }
  }, [locale, bio, originalLanguage, translateText]);

  if (isTranslating) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    );
  }

  return <p className={className}>{translatedBio}</p>;
}
