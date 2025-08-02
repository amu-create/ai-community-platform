-- 주간 활성 사용자 조회 함수
CREATE OR REPLACE FUNCTION get_weekly_active_users(
  week_start TIMESTAMP WITH TIME ZONE,
  week_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  resource_count BIGINT,
  post_count BIGINT,
  comment_count BIGINT,
  vote_count BIGINT,
  total_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_activity AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.full_name,
      p.avatar_url,
      -- 리소스 수
      (SELECT COUNT(*) FROM resources r 
       WHERE r.user_id = p.id 
       AND r.created_at >= week_start 
       AND r.created_at <= week_end) as resource_count,
      -- 포스트 수
      (SELECT COUNT(*) FROM posts po 
       WHERE po.user_id = p.id 
       AND po.created_at >= week_start 
       AND po.created_at <= week_end) as post_count,
      -- 댓글 수
      (SELECT COUNT(*) FROM comments c 
       WHERE c.user_id = p.id 
       AND c.created_at >= week_start 
       AND c.created_at <= week_end) as comment_count,
      -- 받은 투표 수
      (SELECT COUNT(*) FROM votes v 
       JOIN posts po2 ON v.post_id = po2.id
       WHERE po2.user_id = p.id 
       AND v.created_at >= week_start 
       AND v.created_at <= week_end) as vote_count
    FROM profiles p
  )
  SELECT 
    ua.*,
    -- 총 점수 계산: 리소스*5 + 포스트*3 + 댓글*1 + 받은투표*2
    (ua.resource_count * 5 + 
     ua.post_count * 3 + 
     ua.comment_count * 1 + 
     ua.vote_count * 2) as total_score
  FROM user_activity ua
  WHERE ua.resource_count > 0 
     OR ua.post_count > 0 
     OR ua.comment_count > 0
  ORDER BY total_score DESC;
END;
$$ LANGUAGE plpgsql;

-- 주간 베스트 콘텐츠 저장 테이블
CREATE TABLE IF NOT EXISTS weekly_best (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start TIMESTAMP WITH TIME ZONE NOT NULL,
  week_end TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(week_start, week_end)
);

-- 인덱스 생성
CREATE INDEX idx_weekly_best_week ON weekly_best(week_start, week_end);
CREATE INDEX idx_weekly_best_created ON weekly_best(created_at DESC);

-- RLS 정책 (읽기 전용)
ALTER TABLE weekly_best ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weekly best content"
ON weekly_best FOR SELECT
TO authenticated, anon
USING (true);
