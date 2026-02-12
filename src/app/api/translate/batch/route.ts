import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { translateBatch } from '@/lib/translate';

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
    const { texts, targetLang, sourceLang } = body;

    if (!texts || !Array.isArray(texts) || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const translatedTexts = await translateBatch(
      texts,
      targetLang,
      sourceLang,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      translatedTexts,
    });
  } catch (error: any) {
    console.error('Batch translation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
