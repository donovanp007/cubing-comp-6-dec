-- Add advancement configuration columns to rounds table
-- This allows configuring how many students advance from each round

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS advancement_type TEXT DEFAULT 'percentage' CHECK (advancement_type IN ('percentage', 'count', 'time', 'all'));

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS cutoff_percentage INTEGER DEFAULT 75 CHECK (cutoff_percentage >= 0 AND cutoff_percentage <= 100);

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS cutoff_count INTEGER DEFAULT 8 CHECK (cutoff_count > 0);

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS cutoff_time_milliseconds INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rounds_advancement_type
ON rounds(competition_event_id, advancement_type);

-- Add comments
COMMENT ON COLUMN rounds.advancement_type IS 'How to determine advancement: percentage, count, time, or all';
COMMENT ON COLUMN rounds.cutoff_percentage IS 'For percentage advancement: 1-100 representing top X%';
COMMENT ON COLUMN rounds.cutoff_count IS 'For count advancement: number of competitors advancing';
COMMENT ON COLUMN rounds.cutoff_time_milliseconds IS 'For time-based advancement: milliseconds threshold';
