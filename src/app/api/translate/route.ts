import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { translateText } from '@/lib/translate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, targetLang, sourceLang } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const translatedText = await translateText(
      text,
      targetLang,
      sourceLang,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      translatedText,
    });
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
