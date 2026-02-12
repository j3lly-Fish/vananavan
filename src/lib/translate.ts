import { Translate } from '@google-cloud/translate/build/src/v2';

// Initialize Google Translate client
const translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

// Rate limiting storage (in-memory, would use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Maximum requests per hour per user
const MAX_REQUESTS_PER_HOUR = 100;

/**
 * Check if user has exceeded rate limit
 */
function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize rate limit
        rateLimitStore.set(userId, {
            count: 1,
            resetTime: now + 60 * 60 * 1000, // 1 hour from now
        });
        return true;
    }

    if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
        return false; // Rate limit exceeded
    }

    // Increment count
    userLimit.count++;
    return true;
}

/**
 * Translate text using Google Translate API
 * @param text - Text to translate
 * @param targetLang - Target language code (e.g., 'es', 'en')
 * @param sourceLang - Source language code (optional, auto-detected if not provided)
 * @param userId - User ID for rate limiting (optional)
 * @returns Translated text or original text if translation fails
 */
export async function translateText(
    text: string,
    targetLang: string,
    sourceLang?: string,
    userId?: string
): Promise<string> {
    // Return original if no text
    if (!text || text.trim() === '') {
        return text;
    }

    // Check API key
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
        console.error('Google Translate API key not configured');
        return text; // Fallback to original text
    }

    // Check rate limit if userId provided
    if (userId && !checkRateLimit(userId)) {
        console.warn(`Rate limit exceeded for user: ${userId}`);
        return text; // Fallback to original text
    }

    try {
        const [translation] = await translate.translate(text, {
            from: sourceLang,
            to: targetLang,
        });

        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Fallback to original text on error
    }
}

/**
 * Translate multiple texts in batch
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (optional)
 * @param userId - User ID for rate limiting (optional)
 * @returns Array of translated texts
 */
export async function translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang?: string,
    userId?: string
): Promise<string[]> {
    // Return originals if no texts
    if (!texts || texts.length === 0) {
        return texts;
    }

    // Check API key
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
        console.error('Google Translate API key not configured');
        return texts; // Fallback to original texts
    }

    // Check rate limit if userId provided (count as one request for batch)
    if (userId && !checkRateLimit(userId)) {
        console.warn(`Rate limit exceeded for user: ${userId}`);
        return texts; // Fallback to original texts
    }

    try {
        const [translations] = await translate.translate(texts, {
            from: sourceLang,
            to: targetLang,
        });

        return Array.isArray(translations) ? translations : [translations];
    } catch (error) {
        console.error('Batch translation error:', error);
        return texts; // Fallback to original texts on error
    }
}

/**
 * Detect language of text
 * @param text - Text to detect language for
 * @returns Language code (e.g., 'en', 'es') or null if detection fails
 */
export async function detectLanguage(text: string): Promise<string | null> {
    if (!text || text.trim() === '') {
        return null;
    }

    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
        console.error('Google Translate API key not configured');
        return null;
    }

    try {
        const [detection] = await translate.detect(text);
        return detection.language;
    } catch (error) {
        console.error('Language detection error:', error);
        return null;
    }
}
