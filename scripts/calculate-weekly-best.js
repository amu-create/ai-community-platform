const { createClient } = require('@supabase/supabase-js');

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function calculateWeeklyBest() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 주간 인기 리소스 계산
    const { data: topResources } = await supabase
      .from('resources')
      .select('*, vote_count, view_count, bookmark_count')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('vote_count', { ascending: false })
      .limit(10);

    // 주간 인기 포스트 계산
    const { data: topPosts } = await supabase
      .from('posts')
      .select('*, vote_count, view_count, comment_count')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('vote_count', { ascending: false })
      .limit(10);

    // 주간 활동 사용자 계산
    const { data: activeUsers } = await supabase
      .from('user_activities')
      .select('user_id, count')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('count', { ascending: false })
      .limit(10);

    // 결과를 weekly_highlights 테이블에 저장
    const weeklyData = {
      week_start: oneWeekAgo.toISOString(),
      week_end: new Date().toISOString(),
      top_resources: topResources,
      top_posts: topPosts,
      active_users: activeUsers,
      metadata: {
        calculated_at: new Date().toISOString(),
        total_resources: topResources?.length || 0,
        total_posts: topPosts?.length || 0,
      }
    };

    const { error } = await supabase
      .from('weekly_highlights')
      .insert(weeklyData);

    if (error) {
      console.error('Error saving weekly highlights:', error);
      process.exit(1);
    }

    console.log('Weekly highlights calculated successfully');
    
    // 알림 생성 (활성 사용자들에게)
    if (activeUsers && activeUsers.length > 0) {
      const notifications = activeUsers.map(user => ({
        user_id: user.user_id,
        type: 'weekly_highlights',
        title: '주간 베스트 콘텐츠가 업데이트되었습니다!',
        message: '이번 주 가장 인기 있었던 콘텐츠를 확인해보세요.',
        metadata: { week_id: weeklyData.id }
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

  } catch (error) {
    console.error('Error calculating weekly best:', error);
    process.exit(1);
  }
}

// 스크립트 실행
calculateWeeklyBest();
