-- COMPLETE SUPABASE SETUP
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables and policies (clean slate)
DROP TABLE IF EXISTS sales_opportunities CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Create schools table
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  target_enrollment INTEGER DEFAULT 0,
  current_enrollment INTEGER DEFAULT 0,
  monthly_cost DECIMAL(10,2) DEFAULT 0,
  program_fee_per_student DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  grade INTEGER DEFAULT 5,
  parent_name VARCHAR(200) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  class_type VARCHAR(100) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'outstanding',
  consent_received BOOLEAN DEFAULT FALSE,
  certificate_given BOOLEAN DEFAULT FALSE,
  cube_received BOOLEAN DEFAULT FALSE,
  items_purchased TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS completely for development
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Insert sample schools
INSERT INTO schools (name, target_enrollment, monthly_cost, program_fee_per_student) VALUES
  ('Default School', 30, 2000, 400),
  ('Riverside Primary', 30, 2500, 450),
  ('Mountain View High', 25, 3200, 520);

-- Insert sample students
INSERT INTO students (first_name, last_name, school_id, grade, parent_name, parent_phone, parent_email, class_type, status, payment_status, consent_received) VALUES
  ('John', 'Smith', (SELECT id FROM schools WHERE name = 'Default School'), 5, 'Mary Smith', '+27-82-123-4567', 'mary.smith@email.com', 'Beginner Cubing', 'active', 'paid', true),
  ('Sarah', 'Johnson', (SELECT id FROM schools WHERE name = 'Default School'), 6, 'David Johnson', '+27-83-234-5678', 'david.johnson@email.com', 'Intermediate Cubing', 'active', 'outstanding', true);

-- Verify everything works
SELECT 'SETUP COMPLETE' as status;
SELECT 'Schools created:' as info, count(*) as count FROM schools;
SELECT 'Students created:' as info, count(*) as count FROM students;

-- Test query that the app will use
SELECT 
  s.*,
  sch.id as school_id,
  sch.name as school_name,
  sch.target_enrollment,
  sch.current_enrollment,
  sch.monthly_cost,
  sch.program_fee_per_student
FROM students s
LEFT JOIN schools sch ON s.school_id = sch.id
LIMIT 5;