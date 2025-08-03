-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schools table (safe version)
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  current_enrollment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to schools table if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='monthly_cost') THEN
    ALTER TABLE schools ADD COLUMN monthly_cost DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='program_fee_per_student') THEN
    ALTER TABLE schools ADD COLUMN program_fee_per_student DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create students table (safe version)
CREATE TABLE IF NOT EXISTS students (
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

-- Add missing columns to students table if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='items_purchased') THEN
    ALTER TABLE students ADD COLUMN items_purchased TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='tags') THEN
    ALTER TABLE students ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create payments table (safe version)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table (safe version)
CREATE TABLE IF NOT EXISTS reminders (
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

-- Create inventory_items table (safe version)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('cube', 'accessory', 'educational', 'other')),
  sku VARCHAR(100) NOT NULL UNIQUE,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  supplier VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_opportunities table (safe version)
CREATE TABLE IF NOT EXISTS sales_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'sold', 'not_interested')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_opportunities_updated_at ON sales_opportunities;
CREATE TRIGGER update_sales_opportunities_updated_at BEFORE UPDATE ON sales_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update school enrollment count (if not exists)
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

-- Create trigger to automatically update school enrollment (drop and recreate)
DROP TRIGGER IF EXISTS update_school_enrollment_trigger ON students;
CREATE TRIGGER update_school_enrollment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION update_school_enrollment();

-- Insert sample schools (only if they don't exist)
INSERT INTO schools (name, target_enrollment, monthly_cost, program_fee_per_student) 
SELECT * FROM (VALUES
  ('Riverside Primary', 30, 1500.00, 150.00),
  ('Mountain View High', 25, 1200.00, 180.00),
  ('Oakwood Elementary', 35, 2000.00, 120.00),
  ('Central Academy', 40, 2500.00, 200.00),
  ('Sunrise School', 20, 800.00, 100.00)
) AS new_schools(name, target_enrollment, monthly_cost, program_fee_per_student)
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE schools.name = new_schools.name);

-- Insert sample students (only if they don't exist)
INSERT INTO students (first_name, last_name, school_id, grade, parent_name, parent_phone, parent_email, class_type, status, payment_status)
SELECT * FROM (
  SELECT 
    'John' as first_name, 'Smith' as last_name, 
    (SELECT id FROM schools WHERE name = 'Riverside Primary') as school_id,
    5 as grade, 'Mary Smith' as parent_name, '+27-82-123-4567' as parent_phone, 
    'mary.smith@email.com' as parent_email, 'Beginner Cubing' as class_type, 
    'active' as status, 'paid' as payment_status
  UNION ALL
  SELECT 'Sarah', 'Johnson', (SELECT id FROM schools WHERE name = 'Riverside Primary'), 
    6, 'David Johnson', '+27-83-234-5678', 'david.johnson@email.com', 
    'Intermediate Cubing', 'active', 'outstanding'
  UNION ALL
  SELECT 'Mike', 'Williams', (SELECT id FROM schools WHERE name = 'Mountain View High'), 
    9, 'Lisa Williams', '+27-84-345-6789', 'lisa.williams@email.com', 
    'Advanced Cubing', 'in_progress', 'paid'
  UNION ALL
  SELECT 'Emma', 'Brown', (SELECT id FROM schools WHERE name = 'Oakwood Elementary'), 
    4, 'Tom Brown', '+27-85-456-7890', 'tom.brown@email.com', 
    'Beginner Cubing', 'active', 'partial'
  UNION ALL
  SELECT 'James', 'Davis', (SELECT id FROM schools WHERE name = 'Central Academy'), 
    7, 'Anna Davis', '+27-86-567-8901', 'anna.davis@email.com', 
    'Speed Cubing', 'completed', 'paid'
) sample_students
WHERE NOT EXISTS (
  SELECT 1 FROM students 
  WHERE first_name = sample_students.first_name 
  AND last_name = sample_students.last_name
);

-- Insert sample inventory items (only if they don't exist)
INSERT INTO inventory_items (name, category, sku, cost_price, selling_price, current_stock, minimum_stock, supplier, description)
SELECT * FROM (VALUES
  ('3x3 Speed Cube', 'cube', 'CUBE-3X3-001', 5.00, 15.00, 50, 10, 'MoYu', 'Professional 3x3 speed cube for competitions'),
  ('2x2 Pocket Cube', 'cube', 'CUBE-2X2-001', 3.00, 10.00, 30, 5, 'QiYi', 'Compact 2x2 cube perfect for beginners'),
  ('Cube Timer', 'accessory', 'ACC-TIMER-001', 8.00, 20.00, 25, 5, 'SpeedStacks', 'Digital timer for cubing practice'),
  ('Cube Mat', 'accessory', 'ACC-MAT-001', 2.00, 8.00, 40, 10, 'Generic', 'Soft mat to protect cubes during practice'),
  ('Beginner Guide Book', 'educational', 'EDU-BOOK-001', 3.00, 12.00, 20, 5, 'Cubing Publishing', 'Step-by-step guide for new cubers')
) AS new_items(name, category, sku, cost_price, selling_price, current_stock, minimum_stock, supplier, description)
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE inventory_items.sku = new_items.sku);

-- Enable Row Level Security (safe)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow all operations on schools" ON schools;
  DROP POLICY IF EXISTS "Allow all operations on students" ON students;
  DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
  DROP POLICY IF EXISTS "Allow all operations on reminders" ON reminders;
  DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON inventory_items;
  DROP POLICY IF EXISTS "Allow all operations on sales_opportunities" ON sales_opportunities;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create policies (for now, allow all operations - adjust based on authentication needs)
CREATE POLICY "Allow all operations on schools" ON schools FOR ALL USING (true);
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales_opportunities" ON sales_opportunities FOR ALL USING (true);