-- Migration to add visibility column to existing queries table
-- Run this if you have an existing database

-- Add visibility column with default value
ALTER TABLE queries 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) DEFAULT 'private' 
CHECK (visibility IN ('public', 'private'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_queries_visibility ON queries(visibility);

-- Update RLS policies to allow public query access
DROP POLICY IF EXISTS "Anyone can view public queries" ON queries;
CREATE POLICY "Anyone can view public queries" ON queries
  FOR SELECT USING (visibility = 'public');

-- Update existing queries to have private visibility (if they don't already)
UPDATE queries 
SET visibility = 'private' 
WHERE visibility IS NULL;
