-- Add competition_type field to distinguish major competitions from termly leagues
-- Run this migration to enable filtering rankings by competition type

ALTER TABLE competitions
ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'major'
CHECK (competition_type IN ('major', 'termly_league'));

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_competitions_type ON competitions(competition_type);

-- Comment for documentation
COMMENT ON COLUMN competitions.competition_type IS 'Type of competition: major (full competitions) or termly_league (weekly league)';
