import enMessages from '../../locales/en.json';
import esMessages from '../../locales/es.json';

export type Locale = 'en' | 'es';

const messages = {
  en: enMessages,
  es: esMessages,
};

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}

export function getNestedValue(obj: any, path: string): string {
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

export function t(messages: any, key: string, params?: Record<string, string | number>): string {
  let text = getNestedValue(messages, key);

  // Replace parameters like {count}
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, String(value));
    });
  }

  return text;
}
