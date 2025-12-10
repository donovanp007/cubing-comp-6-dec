-- =============================================
-- APPLY ALL MISSING DATABASE MIGRATIONS
-- =============================================
-- Run this in Supabase SQL Editor to fix all issues
-- This applies critical migrations that haven't been run yet

-- =============================================
-- 1. ADD ADVANCEMENT STATUS TO FINAL_SCORES
-- =============================================
ALTER TABLE final_scores
ADD COLUMN IF NOT EXISTS advancement_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_final_scores_advancement_status
ON final_scores(round_id, advancement_status);

-- =============================================
-- 2. FIX RANKINGS RLS POLICIES
-- =============================================

-- Enable RLS on missing tables
ALTER TABLE IF EXISTS student_competition_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS competition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievement_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies to student_competition_history
DROP POLICY IF EXISTS "History is publicly readable" ON student_competition_history;
DROP POLICY IF EXISTS "Anyone can insert history" ON student_competition_history;
DROP POLICY IF EXISTS "Anyone can update history" ON student_competition_history;
DROP POLICY IF EXISTS "Anyone can delete history" ON student_competition_history;

CREATE POLICY "History is publicly readable" ON student_competition_history
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert history" ON student_competition_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update history" ON student_competition_history
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete history" ON student_competition_history
  FOR DELETE USING (true);

-- Add RLS policies to competition_records
DROP POLICY IF EXISTS "Records are publicly readable" ON competition_records;
DROP POLICY IF EXISTS "Anyone can create records" ON competition_records;
DROP POLICY IF EXISTS "Anyone can update records" ON competition_records;
DROP POLICY IF EXISTS "Anyone can delete records" ON competition_records;

CREATE POLICY "Records are publicly readable" ON competition_records
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create records" ON competition_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update records" ON competition_records
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete records" ON competition_records
  FOR DELETE USING (true);

-- Add RLS policies to achievement_log
DROP POLICY IF EXISTS "Achievements are publicly readable" ON achievement_log;
DROP POLICY IF EXISTS "Anyone can create achievements" ON achievement_log;
DROP POLICY IF EXISTS "Anyone can update achievements" ON achievement_log;
DROP POLICY IF EXISTS "Anyone can delete achievements" ON achievement_log;

CREATE POLICY "Achievements are publicly readable" ON achievement_log
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create achievements" ON achievement_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update achievements" ON achievement_log
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete achievements" ON achievement_log
  FOR DELETE USING (true);

-- =============================================
-- 3. VERIFY MIGRATIONS APPLIED
-- =============================================

-- Check if advancement_status column exists
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name='final_scores' AND column_name='advancement_status';

-- Check RLS is enabled
-- SELECT schemaname, tablename FROM pg_tables
-- WHERE tablename IN ('final_scores', 'student_competition_history', 'competition_records', 'achievement_log');
