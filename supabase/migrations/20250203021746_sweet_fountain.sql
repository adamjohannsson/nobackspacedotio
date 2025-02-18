/*
  # Create user stats view

  1. Changes
    - Create materialized view for user statistics
    - Add function to refresh the view
    - Add security policies for public access
    
  2. Details
    - Tracks user streaks, average characters, and backspaces per note
    - Automatically refreshes when underlying data changes
    - Allows public read access for leaderboard functionality
*/

-- Create materialized view for better performance
CREATE MATERIALIZED VIEW user_stats AS
WITH user_streaks AS (
  SELECT 
    user_id,
    MAX(streak_length) as streak
  FROM (
    SELECT 
      user_id,
      COUNT(*) as streak_length
    FROM (
      SELECT 
        user_id,
        created_at::date as note_date,
        created_at::date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at::date))::integer AS grp
      FROM notes
    ) daily_notes
    GROUP BY user_id, grp
  ) streaks
  GROUP BY user_id
)
SELECT 
  p.username,
  COALESCE(s.streak, 0) as streak,
  ROUND(AVG(LENGTH(n.content))) as avg_characters,
  ROUND(AVG(n.backspace_count)) as backspaces_per_note
FROM profiles p
LEFT JOIN notes n ON p.id = n.user_id
LEFT JOIN user_streaks s ON p.id = s.user_id
WHERE p.username IS NOT NULL
GROUP BY p.id, p.username, s.streak;

-- Create index for better query performance
CREATE INDEX user_stats_streak_idx ON user_stats (streak DESC);
CREATE INDEX user_stats_backspaces_idx ON user_stats (backspaces_per_note ASC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the view when data changes
CREATE TRIGGER refresh_user_stats_on_notes
AFTER INSERT OR UPDATE OR DELETE ON notes
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_stats();

CREATE TRIGGER refresh_user_stats_on_profiles
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_stats();

-- Grant public access to the view
GRANT SELECT ON user_stats TO anon, authenticated;