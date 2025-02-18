/*
  # Add Premium Status Column
  
  1. Changes
    - Add is_premium column to profiles table
    - Set default value to false
    - Add index for better query performance
  
  2. Security
    - Enable RLS on the table
    - Add policy for users to read their own premium status
*/

-- Add is_premium column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for reading premium status if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read own premium status'
  ) THEN
    CREATE POLICY "Users can read own premium status"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;