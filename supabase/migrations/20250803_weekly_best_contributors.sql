-- Function to get weekly top contributors
CREATE OR REPLACE FUNCTION get_weekly_top_contributors(days integer DEFAULT 7)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  contribution_count bigint,
  total_score bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH contributions AS (
    -- Count resources
    SELECT 
      r.author_id as user_id,
      COUNT(*) as count,
      SUM(r.view_count + r.upvotes * 10) as score
    FROM resources r
    WHERE r.created_at >= NOW() - INTERVAL '1 day' * days
    GROUP BY r.author_id
    
    UNION ALL
    
    -- Count posts
    SELECT 
      p.author_id as user_id,
      COUNT(*) as count,
      SUM(p.view_count + p.upvotes * 10) as score
    FROM posts p
    WHERE p.created_at >= NOW() - INTERVAL '1 day' * days
    GROUP BY p.author_id
  ),
  aggregated AS (
    SELECT 
      c.user_id,
      SUM(c.count) as contribution_count,
      SUM(c.score) as total_score
    FROM contributions c
    GROUP BY c.user_id
  )
  SELECT 
    a.user_id,
    p.username,
    p.avatar_url,
    a.contribution_count,
    a.total_score
  FROM aggregated a
  JOIN profiles p ON a.user_id = p.id
  ORDER BY a.total_score DESC, a.contribution_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_weekly_top_contributors TO authenticated;
