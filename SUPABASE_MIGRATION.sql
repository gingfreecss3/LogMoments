-- Migration: Add photo support to moments table
-- Run this SQL in your Supabase SQL Editor to add photo support

-- Add photo column to moments table
ALTER TABLE moments
ADD COLUMN IF NOT EXISTS photo TEXT;

-- Add comment to the column
COMMENT ON COLUMN moments.photo IS 'Base64 data URL of photo attachment for the moment';

-- Create an index on moments with photos for faster queries
CREATE INDEX IF NOT EXISTS idx_moments_has_photo ON moments ((photo IS NOT NULL));

-- If you need to check for moments with photos in the future
-- SELECT COUNT(*) FROM moments WHERE photo IS NOT NULL;
