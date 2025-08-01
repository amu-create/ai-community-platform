import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAndStoreEmbedding } from '@/lib/ai/recommendations';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 요청 바디 파싱
    const body = await request.json();
    const { contentId, contentType, text } = body;
    
    if (!contentId || !contentType || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 임베딩 생성 및 저장
    const result = await createAndStoreEmbedding(contentId, contentType, text);
    
    if (!result.success) {
      throw new Error('Failed to create embedding');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Embedding created successfully',
    });
  } catch (error) {
    console.error('Error creating embedding:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create embedding' },
      { status: 500 }
    );
  }
}
