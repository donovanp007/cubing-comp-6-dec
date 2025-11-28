-- =============================================
-- MIGRATION: Add school_id FK to students table
-- This script adds a foreign key relationship to the schools table
-- while keeping the existing school TEXT field for backward compatibility
-- =============================================

-- Step 1: Add the school_id column with foreign key
ALTER TABLE students ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- Step 3: Create index on school TEXT field for the migration process
CREATE INDEX IF NOT EXISTS idx_students_school_text ON students(school);

-- NOTE: The next step will be to populate school_id from school TEXT field
-- using the migration script in src/lib/migrations/migrate-schools.ts
-- After migration is complete and verified, the school TEXT column should be dropped:
-- ALTER TABLE students DROP COLUMN school;

-- RLS policy for school_id access
-- (Add to existing students RLS policies)
