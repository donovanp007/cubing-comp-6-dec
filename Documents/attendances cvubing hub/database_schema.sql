-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS solve_times CASCADE;
DROP TABLE IF EXISTS merit_points CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;

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

-- Add Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE merit_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE solve_times ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (you can restrict these later)
CREATE POLICY "Enable all operations for schools" ON schools FOR ALL USING (true);
CREATE POLICY "Enable all operations for coaches" ON coaches FOR ALL USING (true);
CREATE POLICY "Enable all operations for classes" ON classes FOR ALL USING (true);
CREATE POLICY "Enable all operations for students" ON students FOR ALL USING (true);
CREATE POLICY "Enable all operations for attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Enable all operations for notes" ON notes FOR ALL USING (true);
CREATE POLICY "Enable all operations for merit_points" ON merit_points FOR ALL USING (true);
CREATE POLICY "Enable all operations for solve_times" ON solve_times FOR ALL USING (true);
