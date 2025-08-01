import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/feed - 팔로우 기반 피드
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const feedType = req.nextUrl.searchParams.get('type') || 'following'; // following | all

    const offset = (page - 1) * limit;

    if (feedType === 'following') {
      // 팔로우하는 사용자들의 게시물 가져오기
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];
      
      // 자신의 게시물도 포함
      followingIds.push(user.id);

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            avatar_url,
            bio
          ),
          _count:posts(count)
        `, { count: 'exact' })
        .in('author_id', followingIds)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 좋아요, 댓글 수 등 추가 정보 가져오기
      if (data) {
        const postIds = data.map(post => post.id);
        
        // 댓글 수 가져오기
        const { data: repliesCount } = await supabase
          .from('posts')
          .select('parent_id')
          .in('parent_id', postIds);

        const repliesMap = new Map<string, number>();
        repliesCount?.forEach(reply => {
          repliesMap.set(reply.parent_id, (repliesMap.get(reply.parent_id) || 0) + 1);
        });

        // 각 게시물에 댓글 수 추가
        data.forEach(post => {
          post.replies_count = repliesMap.get(post.id) || 0;
        });
      }

      return NextResponse.json({
        data: data || [],
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      });
    } else {
      // 모든 게시물 (탐색 피드)
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            avatar_url,
            bio
          )
        `, { count: 'exact' })
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 좋아요, 댓글 수 등 추가 정보 가져오기
      if (data) {
        const postIds = data.map(post => post.id);
        
        // 댓글 수 가져오기
        const { data: repliesCount } = await supabase
          .from('posts')
          .select('parent_id')
          .in('parent_id', postIds);

        const repliesMap = new Map<string, number>();
        repliesCount?.forEach(reply => {
          repliesMap.set(reply.parent_id, (repliesMap.get(reply.parent_id) || 0) + 1);
        });

        // 팔로우 상태 확인
        const authorIds = data.map(post => post.author_id);
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', authorIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);

        // 각 게시물에 추가 정보 추가
        data.forEach(post => {
          post.replies_count = repliesMap.get(post.id) || 0;
          if (post.author) {
            post.author.is_following = followingSet.has(post.author.id);
          }
        });
      }

      return NextResponse.json({
        data: data || [],
        count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      });
    }
  } catch (error) {
    console.error('피드 조회 오류:', error);
    return NextResponse.json({ error: '피드 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}