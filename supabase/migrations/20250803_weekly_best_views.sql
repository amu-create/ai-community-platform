-- Create weekly best resources view
CREATE OR REPLACE VIEW weekly_best_resources AS
SELECT 
  r.id,
  r.id as content_id,
  r.title,
  r.description,
  r.url,
  r.type,
  r.author_id as created_by,
  p.username,
  p.avatar_url,
  r.view_count,
  r.upvotes as vote_count,
  -- Calculate score based on multiple factors
  (
    r.view_count * 1 + 
    r.upvotes * 10 +
    (SELECT COUNT(*) FROM bookmarks WHERE resource_id = r.id) * 5
  ) as score
FROM resources r
JOIN profiles p ON r.author_id = p.id
WHERE r.created_at >= NOW() - INTERVAL '7 days'
  AND r.is_featured = true
ORDER BY score DESC
LIMIT 10;

-- Create weekly best posts view
CREATE OR REPLACE VIEW weekly_best_posts AS
SELECT 
  po.id,
  po.id as content_id,
  po.title,
  po.content,
  po.author_id as created_by,
  pr.username,
  pr.avatar_url,
  po.view_count,
  po.upvotes as vote_count,
  (SELECT COUNT(*) FROM comments WHERE post_id = po.id) as comment_count,
  -- Calculate score based on multiple factors
  (
    po.view_count * 1 + 
    po.upvotes * 10 +
    (SELECT COUNT(*) FROM comments WHERE post_id = po.id) * 5 +
    (SELECT COUNT(*) FROM bookmarks WHERE post_id = po.id) * 5
  ) as score
FROM posts po
JOIN profiles pr ON po.author_id = pr.id
WHERE po.created_at >= NOW() - INTERVAL '7 days'
  AND po.is_published = true
ORDER BY score DESC
LIMIT 10;

-- Create function to update weekly best content (can be called by a cron job)
CREATE OR REPLACE FUNCTION update_weekly_best()
RETURNS void AS $$
BEGIN
  -- This function can be extended to store historical data if needed
  -- For now, the views automatically update based on the 7-day window
  RAISE NOTICE 'Weekly best content updated';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON weekly_best_resources TO authenticated;
GRANT SELECT ON weekly_best_posts TO authenticated;
