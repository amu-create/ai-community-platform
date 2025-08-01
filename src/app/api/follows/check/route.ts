import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/follows/check - 팔로우 상태 확인
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = req.nextUrl.searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: '대상 사용자 ID가 필요합니다' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ isFollowing: false });
    }

    // 팔로우 상태 확인
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // not found 에러가 아닌 경우
      throw error;
    }

    return NextResponse.json({ isFollowing: !!data });
  } catch (error) {
    console.error('팔로우 상태 확인 오류:', error);
    return NextResponse.json({ error: '팔로우 상태 확인 중 오류가 발생했습니다' }, { status: 500 });
  }
}