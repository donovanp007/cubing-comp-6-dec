-- Add advancement status tracking to final_scores table
-- This enables automatic tracking of which students advance/are eliminated/are finalists

ALTER TABLE final_scores
ADD COLUMN IF NOT EXISTS advancement_status TEXT DEFAULT 'pending';

-- Types of statuses:
-- 'pending' - Round not yet completed
-- 'advancing' - Student advances to next round ✅
-- 'eliminated' - Student is eliminated ❌
-- 'finalist' - Student is in finals 🏆
-- 'champion' - 1st place / 🥇
-- 'runner_up' - 2nd place / 🥈
-- 'third_place' - 3rd place / 🥉

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_final_scores_advancement_status
ON final_scores(round_id, advancement_status);

-- Add comment explaining the column
COMMENT ON COLUMN final_scores.advancement_status IS
'Tracks student advancement status: pending, advancing, eliminated, finalist, champion, runner_up, third_place';
