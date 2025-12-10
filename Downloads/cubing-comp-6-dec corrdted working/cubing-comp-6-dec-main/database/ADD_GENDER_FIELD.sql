-- Add gender field to students table for rankings (fastest girl cuber stat)
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'not_specified';

-- Add comment to clarify the gender field
-- Values: 'male', 'female', 'other', 'not_specified'
