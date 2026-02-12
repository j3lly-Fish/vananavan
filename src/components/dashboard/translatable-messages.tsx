'use client';

import { useState, useEffect } from 'react';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { useLanguage } from '@/components/providers/language-provider';

interface Message {
  id: string;
  content: string;
  originalLanguage?: string;
  senderId: string;
  createdAt: Date;
}

interface TranslatableMessagesProps {
  messages: Message[];
  className?: string;
  renderMessage: (message: Message, translatedContent: string, isTranslating: boolean) => React.ReactNode;
}

/**
 * Component that automatically translates an array of messages
 * Usage:
 * <TranslatableMessages
 *   messages={conversationMessages}
 *   renderMessage={(msg, translated, loading) => (
 *     <div>{loading ? 'Translating...' : translated}</div>
 *   )}
 * />
 */
export function TranslatableMessages({ messages, className = '', renderMessage }: TranslatableMessagesProps) {
  const { locale } = useLanguage();
  const { translateBatch, isTranslating } = useContentTranslation();
  const [translatedMessages, setTranslatedMessages] = useState<string[]>(messages.map(m => m.content));

  useEffect(() => {
    const textsToTranslate = messages.map(m => m.content);
    const originalLangs = messages.map(m => m.originalLanguage || 'en');

    // Check if any message needs translation
    const needsTranslation = messages.some(m => (m.originalLanguage || 'en') !== locale);

    if (needsTranslation && textsToTranslate.length > 0) {
      // For batch translation, we assume all messages have same original language
      // In production, you might want to group by originalLanguage first
      const mostCommonLang = originalLangs[0] || 'en';
      translateBatch(textsToTranslate, mostCommonLang).then(setTranslatedMessages);
    } else {
      setTranslatedMessages(textsToTranslate);
    }
  }, [locale, messages, translateBatch]);

  return (
    <div className={className}>
      {messages.map((message, index) => (
        <div key={message.id}>
          {renderMessage(message, translatedMessages[index] || message.content, isTranslating)}
        </div>
      ))}
    </div>
  );
}
