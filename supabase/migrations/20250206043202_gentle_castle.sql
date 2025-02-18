/*
  # Add feature requests table

  1. New Tables
    - `feature_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `feature_requests` table
    - Add policies for authenticated users to:
      - Insert their own feature requests
      - Read their own feature requests

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Drop existing objects if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_feature_requests_updated_at ON feature_requests;
DROP FUNCTION IF EXISTS update_feature_request_updated_at();
DROP TABLE IF EXISTS feature_requests;

-- Create feature requests table
CREATE TABLE feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own feature requests"
  ON feature_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own feature requests"
  ON feature_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_request_updated_at();