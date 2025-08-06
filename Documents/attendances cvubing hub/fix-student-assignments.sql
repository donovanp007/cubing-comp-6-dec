-- Fix Student Class Assignments
-- This script ensures all students have a proper class_id assigned

-- Step 1: Create a default "Unassigned Students" class if it doesn't exist
INSERT INTO classes (id, name, grade, school_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Unassigned Students',
    'Mixed',
    (SELECT id FROM schools LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM classes WHERE name = 'Unassigned Students'
);

-- Step 2: Get the ID of the default class
WITH default_class AS (
    SELECT id FROM classes WHERE name = 'Unassigned Students' LIMIT 1
)

-- Step 3: Update all students without a class_id to use the default class
UPDATE students 
SET class_id = (SELECT id FROM default_class),
    updated_at = NOW()
WHERE class_id IS NULL;

-- Step 4: Verify the fix
SELECT 
    'Students with class assignments' as status,
    COUNT(*) as count
FROM students
WHERE class_id IS NOT NULL

UNION ALL

SELECT 
    'Students without class assignments' as status,
    COUNT(*) as count
FROM students
WHERE class_id IS NULL;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- Step 6: Add foreign key constraint to ensure data integrity
ALTER TABLE students 
ADD CONSTRAINT fk_students_class 
FOREIGN KEY (class_id) 
REFERENCES classes(id) 
ON DELETE SET NULL;

-- Step 7: Create a view to easily see class assignments
CREATE OR REPLACE VIEW student_class_assignments AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.surname as student_surname,
    s.grade as student_grade,
    c.id as class_id,
    c.name as class_name,
    c.grade as class_grade,
    sch.name as school_name,
    CASE 
        WHEN c.name = 'Unassigned Students' THEN 'Needs Assignment'
        ELSE 'Assigned'
    END as assignment_status
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN schools sch ON c.school_id = sch.id
ORDER BY assignment_status DESC, class_name, student_name;

-- Step 8: Query to show current assignment status
SELECT 
    assignment_status,
    COUNT(*) as student_count
FROM student_class_assignments
GROUP BY assignment_status;
