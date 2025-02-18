/*
  # Add backspace count tracking

  1. Changes
    - Add `backspace_count` column to `notes` table with default value of 0
    - Make the column non-nullable to ensure data consistency

  2. Notes
    - Default value ensures backward compatibility with existing notes
    - Non-nullable constraint maintains data integrity
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'backspace_count'
  ) THEN
    ALTER TABLE notes 
    ADD COLUMN backspace_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;