-- Add round_type field to distinguish between regular rounds, semifinals, and finals
-- This allows the system to track which rounds are leading to finals

-- Step 1: Add round_type column
ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS round_type TEXT DEFAULT 'round'
CHECK (round_type IN ('round', 'semifinal', 'final'));

-- Step 2: Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_rounds_type ON rounds(round_type);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN rounds.round_type IS 'Type of round: regular round, semifinal, or final. Determines progression to finals.';
