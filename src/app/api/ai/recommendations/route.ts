import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPersonalizedRecommendations } from '@/lib/ai/recommendations';
import { AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
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
    
    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('type') as 'resource' | 'learning_path' | 'post' | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const excludeIds = searchParams.get('exclude')?.split(',') || [];
    
    // 추천 가져오기
    const recommendations = await getPersonalizedRecommendations({
      userId: user.id,
      contentType: contentType || undefined,
      limit,
      excludeIds,
    });
    
    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
