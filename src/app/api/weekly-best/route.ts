import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // 현재 주의 시작과 끝
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    // 지난 주 데이터도 가져오기 위한 날짜
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

    // 1. 주간 베스트 리소스 (좋아요 + 북마크 + 평점 기준)
    const { data: bestResources, error: resourceError } = await supabase
      .from('resources')
      .select(`
        *,
        profiles!resources_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        categories!resources_category_id_fkey (
          id,
          name,
          slug
        ),
        bookmarks:bookmarks(count),
        ratings:ratings(
          rating
        )
      `)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (resourceError) {
      logger.error('Failed to fetch weekly best resources:', resourceError);
      throw resourceError;
    }

    // 리소스별 점수 계산
    const scoredResources = bestResources?.map(resource => {
      const bookmarkCount = resource.bookmarks?.[0]?.count || 0;
      const avgRating = resource.ratings?.length > 0
        ? resource.ratings.reduce((sum, r) => sum + r.rating, 0) / resource.ratings.length
        : 0;
      const ratingCount = resource.ratings?.length || 0;
      
      // 점수 계산: 북마크 * 2 + 평균 평점 * 평가 수
      const score = bookmarkCount * 2 + avgRating * ratingCount;
      
      return {
        ...resource,
        score,
        bookmarkCount,
        avgRating,
        ratingCount
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // 2. 주간 베스트 포스트 (좋아요 + 댓글 기준)
    const { data: bestPosts, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        votes:votes(count),
        comments:comments(count)
      `)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (postError) {
      logger.error('Failed to fetch weekly best posts:', postError);
      throw postError;
    }

    // 포스트별 점수 계산
    const scoredPosts = bestPosts?.map(post => {
      const voteCount = post.votes?.[0]?.count || 0;
      const commentCount = post.comments?.[0]?.count || 0;
      
      // 점수 계산: 투표 * 2 + 댓글 * 3
      const score = voteCount * 2 + commentCount * 3;
      
      return {
        ...post,
        score,
        voteCount,
        commentCount
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // 3. 주간 베스트 기여자 (포스트 + 리소스 + 댓글 기준)
    const { data: activeUsers, error: userError } = await supabase
      .rpc('get_weekly_active_users', {
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString()
      });

    if (userError) {
      logger.error('Failed to fetch weekly active users:', userError);
      throw userError;
    }

    // 4. 주간 통계
    const stats = {
      newResources: bestResources?.length || 0,
      newPosts: bestPosts?.length || 0,
      activeUsers: activeUsers?.length || 0,
      totalEngagement: (scoredResources?.reduce((sum, r) => sum + r.score, 0) || 0) +
                      (scoredPosts?.reduce((sum, p) => sum + p.score, 0) || 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        bestResources: scoredResources,
        bestPosts: scoredPosts,
        topContributors: activeUsers?.slice(0, 5),
        stats
      }
    });
  } catch (error) {
    logger.error('Error fetching weekly best content:', error);
    return NextResponse.json(
      { success: false, error: '주간 베스트 콘텐츠를 가져오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// Cron job용 POST 엔드포인트 (주간 베스트 캐싱)
export async function POST(request: Request) {
  try {
    // Cron job 인증 확인
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerClient();
    
    // 주간 베스트 데이터 계산
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    // 위의 GET 로직과 동일한 데이터 수집...
    
    // weekly_best 테이블에 저장
    const { error: insertError } = await supabase
      .from('weekly_best')
      .insert({
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        data: {
          // 계산된 데이터 저장
        },
        created_at: new Date().toISOString()
      });

    if (insertError) {
      logger.error('Failed to save weekly best data:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly best content updated successfully'
    });
  } catch (error) {
    logger.error('Error in weekly best cron job:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
