-- ============================================================================
-- FIX: Disable RLS on results table to test if it's causing unnest error
-- ============================================================================

-- Drop all policies on results table
DROP POLICY IF EXISTS "Results are publicly readable" ON results;
DROP POLICY IF EXISTS "Anyone can record results" ON results;
DROP POLICY IF EXISTS "Anyone can update results" ON results;
DROP POLICY IF EXISTS "Anyone can delete results" ON results;

-- Disable RLS temporarily
ALTER TABLE results DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- After testing, if it works, run the policies again:
-- ============================================================================

-- Re-enable RLS
-- ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Re-create basic policies
-- CREATE POLICY "Results are publicly readable" ON results FOR SELECT USING (true);
-- CREATE POLICY "Anyone can record results" ON results FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can update results" ON results FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete results" ON results FOR DELETE USING (true);
