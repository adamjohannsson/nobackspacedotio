/*
  # Add Stripe columns to profiles table

  1. Changes
    - Add `stripe_customer_id` column to profiles table
    - Add `stripe_subscription_id` column to profiles table
    - Add index on stripe_customer_id for better query performance
  
  2. Security
    - Columns inherit existing RLS policies from profiles table
*/

-- Add Stripe columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);