-- 주간 베스트 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS weekly_best_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('resource', 'post')),
  content_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, week_start)
);

-- 주간 베스트 뷰 (리소스)
CREATE OR REPLACE VIEW weekly_best_resources AS
SELECT 
  wbc.*,
  r.title,
  r.description,
  r.url,
  r.type,
  r.created_by,
  p.username,
  p.avatar_url,
  (SELECT COUNT(*) FROM resource_views WHERE resource_id = r.id) as view_count,
  (SELECT COUNT(*) FROM votes WHERE votable_type = 'resource' AND votable_id = r.id::text) as vote_count
FROM weekly_best_content wbc
JOIN resources r ON wbc.content_id = r.id
JOIN profiles p ON r.created_by = p.id
WHERE wbc.content_type = 'resource'
  AND wbc.week_start <= CURRENT_DATE
  AND wbc.week_end >= CURRENT_DATE;

-- 주간 베스트 뷰 (포스트)
CREATE OR REPLACE VIEW weekly_best_posts AS
SELECT 
  wbc.*,
  p.title,
  p.content,
  p.created_by,
  pr.username,
  pr.avatar_url,
  (SELECT COUNT(*) FROM post_views WHERE post_id = p.id) as view_count,
  (SELECT COUNT(*) FROM votes WHERE votable_type = 'post' AND votable_id = p.id::text) as vote_count,
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
FROM weekly_best_content wbc
JOIN posts p ON wbc.content_id = p.id
JOIN profiles pr ON p.created_by = pr.id
WHERE wbc.content_type = 'post'
  AND wbc.week_start <= CURRENT_DATE
  AND wbc.week_end >= CURRENT_DATE;

-- 주간 베스트 선정 함수
CREATE OR REPLACE FUNCTION calculate_weekly_best_content()
RETURNS void AS $$
DECLARE
  v_week_start DATE;
  v_week_end DATE;
BEGIN
  -- 이번 주 시작과 끝 계산 (월요일 시작)
  v_week_start := date_trunc('week', CURRENT_DATE)::date;
  v_week_end := v_week_start + INTERVAL '6 days';

  -- 기존 데이터 삭제
  DELETE FROM weekly_best_content 
  WHERE week_start = v_week_start;

  -- 리소스 상위 10개 선정
  INSERT INTO weekly_best_content (content_type, content_id, week_start, week_end, score)
  SELECT 
    'resource',
    r.id,
    v_week_start,
    v_week_end,
    COALESCE(vote_count, 0) * 10 + COALESCE(view_count, 0) + COALESCE(bookmark_count, 0) * 5 as score
  FROM resources r
  LEFT JOIN (
    SELECT votable_id::uuid as resource_id, COUNT(*) as vote_count 
    FROM votes 
    WHERE votable_type = 'resource' 
      AND created_at >= v_week_start
    GROUP BY votable_id
  ) v ON r.id = v.resource_id
  LEFT JOIN (
    SELECT resource_id, COUNT(*) as view_count 
    FROM resource_views 
    WHERE viewed_at >= v_week_start
    GROUP BY resource_id
  ) rv ON r.id = rv.resource_id
  LEFT JOIN (
    SELECT resource_id, COUNT(*) as bookmark_count 
    FROM bookmarks 
    WHERE created_at >= v_week_start
    GROUP BY resource_id
  ) b ON r.id = b.resource_id
  WHERE r.created_at >= v_week_start - INTERVAL '30 days' -- 최근 30일 내 생성된 리소스만
  ORDER BY score DESC
  LIMIT 10;

  -- 포스트 상위 10개 선정
  INSERT INTO weekly_best_content (content_type, content_id, week_start, week_end, score)
  SELECT 
    'post',
    p.id,
    v_week_start,
    v_week_end,
    COALESCE(vote_count, 0) * 10 + COALESCE(view_count, 0) + COALESCE(comment_count, 0) * 3 as score
  FROM posts p
  LEFT JOIN (
    SELECT votable_id::uuid as post_id, COUNT(*) as vote_count 
    FROM votes 
    WHERE votable_type = 'post' 
      AND created_at >= v_week_start
    GROUP BY votable_id
  ) v ON p.id = v.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as view_count 
    FROM post_views 
    WHERE viewed_at >= v_week_start
    GROUP BY post_id
  ) pv ON p.id = pv.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count 
    FROM comments 
    WHERE created_at >= v_week_start
    GROUP BY post_id
  ) c ON p.id = c.post_id
  WHERE p.created_at >= v_week_start - INTERVAL '30 days' -- 최근 30일 내 생성된 포스트만
  ORDER BY score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 매주 월요일 자정에 실행되는 cron job 설정 (pg_cron extension 필요)
-- SELECT cron.schedule('calculate-weekly-best', '0 0 * * 1', 'SELECT calculate_weekly_best_content();');

-- RLS 정책
ALTER TABLE weekly_best_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weekly best content" ON weekly_best_content
  FOR SELECT USING (true);

CREATE POLICY "System can manage weekly best content" ON weekly_best_content
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'system')
  ));
