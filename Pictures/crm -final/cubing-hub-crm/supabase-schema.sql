-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schools table
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  current_enrollment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
  parent_name VARCHAR(200) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'concern', 'inactive')),
  class_type VARCHAR(100) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'outstanding' CHECK (payment_status IN ('paid', 'outstanding', 'partial', 'overdue')),
  consent_received BOOLEAN DEFAULT FALSE,
  certificate_given BOOLEAN DEFAULT FALSE,
  cube_received BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update school enrollment count
CREATE OR REPLACE FUNCTION update_school_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current enrollment count for the school
  UPDATE schools 
  SET current_enrollment = (
    SELECT COUNT(*) 
    FROM students 
    WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    AND status IN ('active', 'in_progress')
  )
  WHERE id = COALESCE(NEW.school_id, OLD.school_id);
  
  -- If school_id changed, update both schools
  IF TG_OP = 'UPDATE' AND OLD.school_id != NEW.school_id THEN
    UPDATE schools 
    SET current_enrollment = (
      SELECT COUNT(*) 
      FROM students 
      WHERE school_id = OLD.school_id
      AND status IN ('active', 'in_progress')
    )
    WHERE id = OLD.school_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger to automatically update school enrollment
CREATE TRIGGER update_school_enrollment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION update_school_enrollment();

-- Insert sample schools
INSERT INTO schools (name, target_enrollment) VALUES
  ('Riverside Primary', 30),
  ('Mountain View High', 25),
  ('Oakwood Elementary', 35),
  ('Central Academy', 40),
  ('Sunrise School', 20);

-- Insert sample students
INSERT INTO students (first_name, last_name, school_id, grade, parent_name, parent_phone, parent_email, class_type, status, payment_status) VALUES
  ('John', 'Smith', (SELECT id FROM schools WHERE name = 'Riverside Primary'), 5, 'Mary Smith', '+27-82-123-4567', 'mary.smith@email.com', 'Beginner Cubing', 'active', 'paid'),
  ('Sarah', 'Johnson', (SELECT id FROM schools WHERE name = 'Riverside Primary'), 6, 'David Johnson', '+27-83-234-5678', 'david.johnson@email.com', 'Intermediate Cubing', 'active', 'outstanding'),
  ('Mike', 'Williams', (SELECT id FROM schools WHERE name = 'Mountain View High'), 9, 'Lisa Williams', '+27-84-345-6789', 'lisa.williams@email.com', 'Advanced Cubing', 'in_progress', 'paid'),
  ('Emma', 'Brown', (SELECT id FROM schools WHERE name = 'Oakwood Elementary'), 4, 'Tom Brown', '+27-85-456-7890', 'tom.brown@email.com', 'Beginner Cubing', 'active', 'partial'),
  ('James', 'Davis', (SELECT id FROM schools WHERE name = 'Central Academy'), 7, 'Anna Davis', '+27-86-567-8901', 'anna.davis@email.com', 'Speed Cubing', 'completed', 'paid');

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - adjust based on authentication needs)
CREATE POLICY "Allow all operations on schools" ON schools FOR ALL USING (true);
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);