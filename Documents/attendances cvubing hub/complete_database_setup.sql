-- COMPLETE DATABASE SETUP FOR SCHOOL MANAGEMENT SYSTEM
-- This script sets up all tables in the correct order with cube progress tracking

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS cube_progress_history CASCADE;
DROP TABLE IF EXISTS cube_progress CASCADE;
DROP TABLE IF EXISTS solve_times CASCADE;
DROP TABLE IF EXISTS merit_points CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS cube_type CASCADE;
DROP TYPE IF EXISTS cube_3x3_level CASCADE;
DROP TYPE IF EXISTS cube_2x2_level CASCADE;
DROP TYPE IF EXISTS cube_4x4_level CASCADE;

-- Create schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create coaches table
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create merit_points table
CREATE TABLE merit_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create solve_times table
CREATE TABLE solve_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    time_seconds DECIMAL(10,3) NOT NULL,
    puzzle_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CUBE PROGRESS TRACKING TABLES
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Add Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE merit_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE solve_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE cube_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cube_progress_history ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (you can restrict these later)
CREATE POLICY "Enable all operations for schools" ON schools FOR ALL USING (true);
CREATE POLICY "Enable all operations for coaches" ON coaches FOR ALL USING (true);
CREATE POLICY "Enable all operations for classes" ON classes FOR ALL USING (true);
CREATE POLICY "Enable all operations for students" ON students FOR ALL USING (true);
CREATE POLICY "Enable all operations for attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Enable all operations for notes" ON notes FOR ALL USING (true);
CREATE POLICY "Enable all operations for merit_points" ON merit_points FOR ALL USING (true);
CREATE POLICY "Enable all operations for solve_times" ON solve_times FOR ALL USING (true);
CREATE POLICY "Enable all operations for cube_progress" ON cube_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for cube_progress_history" ON cube_progress_history FOR ALL USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON student_cube_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- INSERT SAMPLE DATA FOR TESTING
-- Insert sample school
INSERT INTO schools (id, name, address) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Rubiks Academy', '123 Cube Street, Puzzle City');

-- Insert sample coach
INSERT INTO coaches (id, name, email) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Coach Smith', 'coach@rubiks.academy');

-- Insert sample class
INSERT INTO classes (id, school_id, coach_id, name, grade) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Beginners Cubing', 'Grade 5');

-- Insert sample students
INSERT INTO students (id, class_id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Alice Johnson'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Bob Smith'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Charlie Brown'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Diana Prince'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Ethan Hunt');

-- Insert default cube progress for sample students (3x3 cross level)
INSERT INTO cube_progress (student_id, cube_type, current_level, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440003', '3x3', '3x3_cross', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', '3x3', '3x3_middle_layer', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', '3x3', '3x3_white_corners', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440006', '3x3', '3x3_cross', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440007', '3x3', '3x3_yellow_face', CURRENT_TIMESTAMP);

-- Insert some sample attendance records
INSERT INTO attendance (student_id, status, date) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'PRESENT', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440004', 'PRESENT', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440005', 'LATE', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440006', 'PRESENT', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440007', 'ABSENT', CURRENT_DATE);

-- Insert some sample solve times
INSERT INTO solve_times (student_id, time_seconds, puzzle_type) VALUES
('550e8400-e29b-41d4-a716-446655440003', 45.123, '3x3'),
('550e8400-e29b-41d4-a716-446655440004', 38.456, '3x3'),
('550e8400-e29b-41d4-a716-446655440005', 52.789, '3x3'),
('550e8400-e29b-41d4-a716-446655440006', 41.234, '3x3'),
('550e8400-e29b-41d4-a716-446655440007', 55.678, '3x3');

-- Insert some sample merit points
INSERT INTO merit_points (student_id, points, category, description) VALUES
('550e8400-e29b-41d4-a716-446655440003', 10, 'Academic Excellence', 'Learned cross pattern quickly'),
('550e8400-e29b-41d4-a716-446655440004', 15, 'Good Behavior', 'Helped other students'),
('550e8400-e29b-41d4-a716-446655440005', 8, 'Class Participation', 'Active in discussions'),
('550e8400-e29b-41d4-a716-446655440006', 12, 'Homework', 'Completed practice exercises'),
('550e8400-e29b-41d4-a716-446655440007', 20, 'Leadership', 'Led group practice session');

-- Verification queries
SELECT 'Schools:' as table_name, count(*) as count FROM schools
UNION ALL
SELECT 'Coaches:', count(*) FROM coaches
UNION ALL
SELECT 'Classes:', count(*) FROM classes
UNION ALL
SELECT 'Students:', count(*) FROM students
UNION ALL
SELECT 'Attendance:', count(*) FROM attendance
UNION ALL
SELECT 'Cube Progress:', count(*) FROM cube_progress
UNION ALL
SELECT 'Merit Points:', count(*) FROM merit_points
UNION ALL
SELECT 'Solve Times:', count(*) FROM solve_times;