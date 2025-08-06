-- Cube Progress Tracking Schema
-- This schema adds cube progress tracking functionality to the school management system

-- Create enum types for cube levels
CREATE TYPE cube_type AS ENUM ('2x2', '3x3', '4x4');

CREATE TYPE cube_3x3_level AS ENUM (
    '3x3_cross',
    '3x3_middle_layer', 
    '3x3_white_corners',
    '3x3_memorization',
    '3x3_yellow_face',
    '3x3_yellow_cross',
    '3x3_last_layer',
    '3x3_advanced_algorithms',
    '3x3_advanced_yellow_cross',
    '3x3_advanced_white_cross',
    '3x3_oll',
    '3x3_completed'
);

CREATE TYPE cube_2x2_level AS ENUM (
    '2x2_basics',
    '2x2_ortega_method',
    '2x2_cll',
    '2x2_eg',
    '2x2_advanced',
    '2x2_completed'
);

CREATE TYPE cube_4x4_level AS ENUM (
    '4x4_centers',
    '4x4_edges',
    '4x4_3x3_stage',
    '4x4_parity',
    '4x4_advanced',
    '4x4_completed'
);

-- Main cube progress table
CREATE TABLE cube_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cube_type cube_type NOT NULL,
    current_level TEXT NOT NULL,
    previous_level TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES coaches(id),
    notes TEXT,
    
    -- Ensure one record per student per cube type
    UNIQUE(student_id, cube_type)
);

-- Cube progress history for tracking changes over time
CREATE TABLE cube_progress_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cube_type cube_type NOT NULL,
    from_level TEXT,
    to_level TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES coaches(id),
    class_id UUID REFERENCES classes(id),
    attendance_date DATE,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_cube_progress_student_id ON cube_progress(student_id);
CREATE INDEX idx_cube_progress_cube_type ON cube_progress(cube_type);
CREATE INDEX idx_cube_progress_updated_at ON cube_progress(updated_at);
CREATE INDEX idx_cube_progress_history_student_id ON cube_progress_history(student_id);
CREATE INDEX idx_cube_progress_history_changed_at ON cube_progress_history(changed_at);
CREATE INDEX idx_cube_progress_history_attendance_date ON cube_progress_history(attendance_date);

-- Function to automatically create history record when progress is updated
CREATE OR REPLACE FUNCTION create_cube_progress_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert history record for updates (not inserts)
    IF TG_OP = 'UPDATE' AND OLD.current_level != NEW.current_level THEN
        INSERT INTO cube_progress_history (
            student_id, 
            cube_type, 
            from_level, 
            to_level, 
            changed_by,
            notes
        ) VALUES (
            NEW.student_id,
            NEW.cube_type,
            OLD.current_level,
            NEW.current_level,
            NEW.updated_by,
            NEW.notes
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create history records
CREATE TRIGGER cube_progress_history_trigger
    AFTER UPDATE ON cube_progress
    FOR EACH ROW
    EXECUTE FUNCTION create_cube_progress_history();

-- View for easy querying of current student cube progress
CREATE VIEW student_cube_progress AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.class_id,
    c.name as class_name,
    cp_2x2.current_level as cube_2x2_level,
    cp_2x2.updated_at as cube_2x2_updated,
    cp_3x3.current_level as cube_3x3_level,
    cp_3x3.updated_at as cube_3x3_updated,
    cp_4x4.current_level as cube_4x4_level,
    cp_4x4.updated_at as cube_4x4_updated
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN cube_progress cp_2x2 ON s.id = cp_2x2.student_id AND cp_2x2.cube_type = '2x2'
LEFT JOIN cube_progress cp_3x3 ON s.id = cp_3x3.student_id AND cp_3x3.cube_type = '3x3'
LEFT JOIN cube_progress cp_4x4 ON s.id = cp_4x4.student_id AND cp_4x4.cube_type = '4x4';

-- Insert default cube progress for existing students
INSERT INTO cube_progress (student_id, cube_type, current_level, updated_at)
SELECT 
    s.id,
    '3x3',
    '3x3_cross',
    CURRENT_TIMESTAMP
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM cube_progress cp 
    WHERE cp.student_id = s.id AND cp.cube_type = '3x3'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cube_progress TO authenticated;
GRANT SELECT, INSERT ON cube_progress_history TO authenticated;
GRANT SELECT ON student_cube_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;