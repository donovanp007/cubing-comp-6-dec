-- Migration: Add "status" column to students table (if missing)
-- Run this in your Supabase SQL editor (or via psql) against the target database.

-- 1) Add the column with the same type, default and constraint used in local schema
ALTER TABLE IF EXISTS public.students
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  CHECK (status IN ('active', 'in_progress', 'completed', 'concern', 'inactive'));

-- 2) Backfill existing rows that may have NULL status (set to 'active' or another appropriate value)
UPDATE public.students
SET status = COALESCE(status, 'active');

-- 3) (Optional) Verify the column exists and constraints are applied
-- This query will show the column definition from information_schema
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'status';

-- 4) (Optional) Run a quick check for rows with unexpected values
SELECT DISTINCT status FROM public.students LIMIT 100;

-- Notes:
-- - After running this migration in the Supabase SQL editor, the schema cache used by the Supabase client should include the column.
-- - If your app still reports schema cache errors, try redeploying the serverless functions or restarting the app/dev server so the client picks up the updated schema.
-- - If your Supabase project enforces Row Level Security and policies, ensure existing policies still behave correctly with the new column.
