-- =============================================
-- FIX RANKINGS PAGE RLS AND DATA FLOW
-- =============================================
-- This migration fixes the rankings page by:
-- 1. Adding RLS policies to student_competition_history table
-- 2. Adding RLS policies to missing tables
-- 3. Ensuring all tables can be publicly accessed

-- =============================================
-- ENABLE RLS ON MISSING TABLES
-- =============================================

ALTER TABLE IF EXISTS student_competition_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS competition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievement_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ADD POLICIES TO student_competition_history
-- =============================================

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

-- =============================================
-- ADD POLICIES TO competition_records
-- =============================================

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

-- =============================================
-- ADD POLICIES TO achievement_log
-- =============================================

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
