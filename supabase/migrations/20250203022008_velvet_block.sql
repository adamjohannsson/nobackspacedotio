/*
  # Fix user_stats materialized view

  1. Changes
    - Drop existing view and dependencies
    - Recreate materialized view with proper permissions
    - Add indexes for performance
    - Create refresh function and triggers
    - Grant proper permissions

  2. Security
    - Grant SELECT to anon and authenticated roles
    - Function uses SECURITY DEFINER for proper permissions
*/

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS refresh_user_stats_on_notes ON notes;
DROP TRIGGER IF EXISTS refresh_user_stats_on_profiles ON profiles;
DROP FUNCTION IF EXISTS refresh_user_stats();
DROP MATERIALIZED VIEW IF EXISTS user_stats;

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

-- Create indexes for better query performance
CREATE INDEX user_stats_streak_idx ON user_stats (streak DESC);
CREATE INDEX user_stats_backspaces_idx ON user_stats (backspaces_per_note ASC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to refresh the view when data changes
CREATE TRIGGER refresh_user_stats_on_notes
AFTER INSERT OR UPDATE OR DELETE ON notes
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_stats();

CREATE TRIGGER refresh_user_stats_on_profiles
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_stats();

-- Grant proper permissions
GRANT SELECT ON user_stats TO anon, authenticated;