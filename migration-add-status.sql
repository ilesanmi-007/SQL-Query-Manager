-- Migration: Add status column to queries table
-- This allows queries to be saved as drafts or published

-- Add status column with default value 'published'
ALTER TABLE queries 
ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'published' 
CHECK (status IN ('draft', 'published'));

-- Update existing queries to have 'published' status
UPDATE queries 
SET status = 'published' 
WHERE status IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);

-- Add comment to document the column
COMMENT ON COLUMN queries.status IS 'Query status: draft (work in progress) or published (ready to use)';
