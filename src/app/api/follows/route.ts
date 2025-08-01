import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/follows - 팔로우하기
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { followingId } = await req.json();

    if (!followingId) {
      return NextResponse.json({ error: '팔로우할 사용자 ID가 필요합니다' }, { status: 400 });
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: '자기 자신을 팔로우할 수 없습니다' }, { status: 400 });
    }

    // 팔로우 추가
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: '이미 팔로우하고 있습니다' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('팔로우 추가 오류:', error);
    return NextResponse.json({ error: '팔로우 처리 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// DELETE /api/follows - 언팔로우하기
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const followingId = req.nextUrl.searchParams.get('followingId');

    if (!followingId) {
      return NextResponse.json({ error: '언팔로우할 사용자 ID가 필요합니다' }, { status: 400 });
    }

    // 팔로우 삭제
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('언팔로우 오류:', error);
    return NextResponse.json({ error: '언팔로우 처리 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// GET /api/follows - 팔로우 목록 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const userId = req.nextUrl.searchParams.get('userId');
    const type = req.nextUrl.searchParams.get('type') || 'followers'; // followers | following
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    if (type === 'followers') {
      // 팔로워 목록 조회
      const { data, error, count } = await supabase
        .from('follows')
        .select(`
          *,
          follower:profiles!follows_follower_id_fkey(
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count
          )
        `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 현재 사용자가 팔로워들을 팔로우하는지 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const followerIds = data.map(f => f.follower_id);
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', followerIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);
        
        data.forEach(follow => {
          if (follow.follower) {
            follow.follower.is_following = followingSet.has(follow.follower.id);
          }
        });
      }

      return NextResponse.json({
        data: data?.map(f => f.follower).filter(Boolean) || [],
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      });
    } else {
      // 팔로잉 목록 조회
      const { data, error, count } = await supabase
        .from('follows')
        .select(`
          *,
          following:profiles!follows_following_id_fkey(
            id,
            username,
            avatar_url,
            bio,
            followers_count,
            following_count
          )
        `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 현재 사용자가 팔로잉하는 사람들을 팔로우하는지 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const followingIds = data.map(f => f.following_id);
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', followingIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);
        
        data.forEach(follow => {
          if (follow.following) {
            follow.following.is_following = followingSet.has(follow.following.id);
          }
        });
      }

      return NextResponse.json({
        data: data?.map(f => f.following).filter(Boolean) || [],
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      });
    }
  } catch (error) {
    console.error('팔로우 목록 조회 오류:', error);
    return NextResponse.json({ error: '팔로우 목록 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}