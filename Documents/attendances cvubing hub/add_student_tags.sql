-- Add tags column to students table for potential client identification
ALTER TABLE students 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add an index for faster tag searches
CREATE INDEX idx_students_tags ON students USING GIN(tags);

-- Update existing students to have empty tags array (they'll be explicitly NULL otherwise)
UPDATE students SET tags = '{}' WHERE tags IS NULL;