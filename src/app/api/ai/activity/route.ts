import { NextRequest, NextResponse } from 'next/server';
import { userProfileAnalysisService } from '@/lib/ai/user-profile-analysis';
import { createClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/error/handlers';
import { AppError } from '@/lib/error/errors';

// 사용자 활동 추적
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED');
    }

    const body = await req.json();
    const { 
      type, 
      contentId, 
      contentType, 
      duration,
      metadata = {} 
    } = body;

    // 유효성 검사
    const validTypes = ['view', 'like', 'comment', 'share', 'bookmark', 'create'];
    const validContentTypes = ['post', 'resource', 'event', 'project'];

    if (!validTypes.includes(type)) {
      throw new AppError('Invalid activity type', 'BAD_REQUEST');
    }

    if (!validContentTypes.includes(contentType)) {
      throw new AppError('Invalid content type', 'BAD_REQUEST');
    }

    if (!contentId) {
      throw new AppError('Content ID is required', 'BAD_REQUEST');
    }

    // 활동 기록
    await userProfileAnalysisService.trackUserActivity({
      type,
      contentId,
      contentType,
      timestamp: new Date(),
      duration,
      metadata: {
        ...metadata,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Activity tracked successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 사용자 관심사 분석
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(req.url);
    const forceUpdate = searchParams.get('forceUpdate') === 'true';

    // 기존 관심사 확인
    if (!forceUpdate) {
      const { data: existingInterests } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (existingInterests) {
        // 최근 업데이트 확인 (24시간 이내)
        const lastUpdate = new Date(existingInterests.updated_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        if (lastUpdate > dayAgo) {
          return NextResponse.json({
            interests: existingInterests,
            cached: true,
          });
        }
      }
    }

    // 사용자 활동 가져오기
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json({
        interests: null,
        message: 'No activities found to analyze',
      });
    }

    // 관심사 분석
    const interests = await userProfileAnalysisService.analyzeUserInterests(
      session.user.id,
      activities.map(a => ({
        type: a.activity_type,
        contentId: a.content_id,
        contentType: a.content_type,
        timestamp: new Date(a.created_at),
        duration: a.duration,
        metadata: a.metadata,
      }))
    );

    return NextResponse.json({
      interests,
      cached: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}