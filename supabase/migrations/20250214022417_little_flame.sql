/*
  # Fix Streak Calculation

  1. Changes
    - Drop existing user_stats materialized view
    - Create new user_stats materialized view with corrected streak calculation
    - Recreate indexes and triggers
    - Update streak calculation to properly handle consecutive days

  2. Technical Details
    - Uses window functions to identify gaps in writing dates
    - Calculates longest streak by grouping consecutive dates
    - Maintains existing column structure and permissions
*/

-- Drop existing objects
DROP TRIGGER IF EXISTS refresh_user_stats_on_notes ON notes;
DROP TRIGGER IF EXISTS refresh_user_stats_on_profiles ON profiles;
DROP FUNCTION IF EXISTS refresh_user_stats();
DROP MATERIALIZED VIEW IF EXISTS user_stats;

-- Create materialized view with corrected streak calculation
CREATE MATERIALIZED VIEW user_stats AS
WITH daily_notes AS (
  -- Get one record per user per day
  SELECT DISTINCT
    user_id,
    created_at::date as note_date
  FROM notes
),
streak_calc AS (
  SELECT
    user_id,
    note_date,
    note_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY note_date))::integer AS streak_group
  FROM daily_notes
),
user_streaks AS (
  SELECT
    user_id,
    MAX(streak_length) as streak
  FROM (
    SELECT
      user_id,
      COUNT(*) as streak_length
    FROM streak_calc
    GROUP BY user_id, streak_group
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

-- Recreate indexes for better query performance
CREATE INDEX user_stats_streak_idx ON user_stats (streak DESC);
CREATE INDEX user_stats_backspaces_idx ON user_stats (backspaces_per_note ASC);

-- Recreate function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to refresh the view when data changes
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

-- Refresh the view immediately to update streaks
REFRESH MATERIALIZED VIEW user_stats;