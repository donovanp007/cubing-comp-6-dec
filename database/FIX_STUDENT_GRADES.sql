-- Standardize student grades to enforce consistent format
-- This migration fixes legacy data and adds constraints to prevent invalid grades

-- Step 1: Normalize existing grade values
-- Convert standalone numbers to "Grade X" format
UPDATE students SET grade = 'Grade ' || grade
WHERE grade IS NOT NULL
AND grade ~ '^[0-9]+$'
AND grade NOT LIKE 'Grade %';

-- Step 2: Set non-standard grades to NULL (will need manual review/correction)
UPDATE students SET grade = NULL
WHERE grade IS NOT NULL
AND grade NOT IN ('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7');

-- Step 3: Add CHECK constraint to enforce valid values
ALTER TABLE students
ADD CONSTRAINT valid_grade CHECK (
  grade IS NULL
  OR grade IN ('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7')
);

-- Add comment for documentation
COMMENT ON COLUMN students.grade IS 'Student grade level: Grade 1 through Grade 7. NULL if not specified.';

-- Create index for grade filtering
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
