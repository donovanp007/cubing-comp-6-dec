-- DEVELOPMENT SETUP - Run this in Supabase SQL Editor
-- This setup disables RLS and creates public access for development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS sales_opportunities CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Create schools table
CREATE TABLE public.schools (
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
CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
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

-- COMPLETELY DISABLE RLS for development
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions to anon and authenticated users
GRANT ALL ON public.schools TO anon;
GRANT ALL ON public.students TO anon;
GRANT ALL ON public.schools TO authenticated;
GRANT ALL ON public.students TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample data
INSERT INTO public.schools (name, target_enrollment, monthly_cost, program_fee_per_student) VALUES
  ('Default School', 30, 2000, 400),
  ('Riverside Primary', 30, 2500, 450),
  ('Mountain View High', 25, 3200, 520);

-- Insert sample students
INSERT INTO public.students (first_name, last_name, school_id, grade, parent_name, parent_phone, parent_email, class_type, status, payment_status, consent_received) VALUES
  ('John', 'Smith', (SELECT id FROM public.schools WHERE name = 'Default School'), 5, 'Mary Smith', '+27-82-123-4567', 'mary.smith@email.com', 'Beginner Cubing', 'active', 'paid', true),
  ('Sarah', 'Johnson', (SELECT id FROM public.schools WHERE name = 'Default School'), 6, 'David Johnson', '+27-83-234-5678', 'david.johnson@email.com', 'Intermediate Cubing', 'active', 'outstanding', true);

-- Test that everything works
SELECT 'SETUP COMPLETE - PUBLIC ACCESS ENABLED' as status;
SELECT 'Schools:' as info, count(*) as count FROM public.schools;
SELECT 'Students:' as info, count(*) as count FROM public.students;