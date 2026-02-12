'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/providers/language-provider';

interface TranslationCache {
  [key: string]: string;
}

export function useContentTranslation() {
  const { locale } = useLanguage();
  const [cache, setCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Translate a single text string
   */
  const translateText = useCallback(
    async (text: string, originalLang?: string): Promise<string> => {
      if (!text || locale === originalLang) {
        return text;
      }

      // Check cache first
      const cacheKey = `${text}_${locale}`;
      if (cache[cacheKey]) {
        return cache[cacheKey];
      }

      setIsTranslating(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLang: locale,
            sourceLang: originalLang,
          }),
        });

        const data = await response.json();
        if (data.success && data.translatedText) {
          // Update cache
          setCache((prev) => ({ ...prev, [cacheKey]: data.translatedText }));
          return data.translatedText;
        }

        return text; // Fallback to original
      } catch (error) {
        console.error('Translation error:', error);
        return text; // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    },
    [locale, cache]
  );

  /**
   * Translate multiple texts in batch
   */
  const translateBatch = useCallback(
    async (texts: string[], originalLang?: string): Promise<string[]> => {
      if (!texts || texts.length === 0 || locale === originalLang) {
        return texts;
      }

      // Check cache and separate cached vs uncached texts
      const results: string[] = new Array(texts.length);
      const toTranslate: { index: number; text: string }[] = [];

      texts.forEach((text, index) => {
        const cacheKey = `${text}_${locale}`;
        if (cache[cacheKey]) {
          results[index] = cache[cacheKey];
        } else {
          toTranslate.push({ index, text });
        }
      });

      // If all cached, return immediately
      if (toTranslate.length === 0) {
        return results;
      }

      setIsTranslating(true);
      try {
        const response = await fetch('/api/translate/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: toTranslate.map((t) => t.text),
            targetLang: locale,
            sourceLang: originalLang,
          }),
        });

        const data = await response.json();
        if (data.success && data.translatedTexts) {
          const newCache: TranslationCache = {};

          // Map translated texts back to original indices
          toTranslate.forEach((item, i) => {
            const translated = data.translatedTexts[i] || item.text;
            results[item.index] = translated;

            // Add to cache
            const cacheKey = `${item.text}_${locale}`;
            newCache[cacheKey] = translated;
          });

          // Update cache
          setCache((prev) => ({ ...prev, ...newCache }));
        } else {
          // Fallback: use original texts for failed translations
          toTranslate.forEach((item) => {
            results[item.index] = item.text;
          });
        }

        return results;
      } catch (error) {
        console.error('Batch translation error:', error);
        // Fallback: use original texts
        toTranslate.forEach((item) => {
          results[item.index] = item.text;
        });
        return results;
      } finally {
        setIsTranslating(false);
      }
    },
    [locale, cache]
  );

  /**
   * Clear translation cache (useful on unmount or language change)
   */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  // Clear cache when locale changes
  useEffect(() => {
    clearCache();
  }, [locale, clearCache]);

  return {
    translateText,
    translateBatch,
    isTranslating,
    clearCache,
  };
}
