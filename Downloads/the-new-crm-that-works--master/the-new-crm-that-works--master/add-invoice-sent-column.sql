-- Add invoice_sent column to existing students table
ALTER TABLE students 
ADD COLUMN invoice_sent BOOLEAN DEFAULT FALSE;

-- Update any existing records to have a default value
UPDATE students 
SET invoice_sent = FALSE 
WHERE invoice_sent IS NULL;