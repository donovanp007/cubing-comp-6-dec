-- Comprehensive Database Migrations for Enhanced CRM Features
-- This includes: Terms, Progress Tracking, Invoices, and Area Management

-- ============================================================================
-- 1. TERMS/PERIODS MANAGEMENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "Term 1 2025", "Q1 2025"
  year INTEGER NOT NULL,
  quarter_or_term VARCHAR(20), -- "Q1", "Q2", "Q3", "Q4", "Term 1", "Term 2", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'archived'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. STUDENT ENROLLMENTS (tracks student per term)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  term_fee DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'enrolled', -- 'enrolled', 'completed', 'withdrawn', 'transferred'
  started_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, term_id)
);

-- ============================================================================
-- 3. INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  sent_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'
  description TEXT,
  zoho_invoice_id VARCHAR(255), -- For Zoho Books integration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50), -- 'cash', 'card', 'transfer', 'cheque', etc.
  reference_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. PROGRESS LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  progress_note TEXT NOT NULL,
  skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', etc.
  milestone_achieved VARCHAR(255),
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. LEARNING MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  course_type VARCHAR(100), -- 'Beginner', 'Intermediate', 'Advanced', etc.
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. MODULE COMPLETIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS module_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  completed_date DATE NOT NULL,
  completion_status VARCHAR(20) DEFAULT 'completed', -- 'in_progress', 'completed'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, module_id, term_id)
);

-- ============================================================================
-- 8. ALTER SCHOOLS TABLE - Add Area Field
-- ============================================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS area VARCHAR(100);
-- Add index for area-based queries
CREATE INDEX IF NOT EXISTS idx_schools_area ON schools(area);

-- ============================================================================
-- 9. CREATE AREAS REFERENCE TABLE (Optional - for standardized areas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. ATTENDANCE RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present', -- 'present', 'absent', 'late', 'excused'
  notes TEXT,
  marked_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. INSERT DEFAULT AREAS
-- ============================================================================
INSERT INTO areas (name, region, description) VALUES
('Milnerton', 'Western Cape', 'Milnerton area schools'),
('Durbanville', 'Western Cape', 'Durbanville area schools'),
('Sunningdale', 'Western Cape', 'Sunningdale area schools'),
('Other', 'Various', 'Other areas')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 12. INSERT DEFAULT LEARNING MODULES
-- ============================================================================
INSERT INTO learning_modules (name, description, course_type, display_order) VALUES
('Layer-by-Layer Basics', 'Introduction to the layer-by-layer solving method', 'Beginner', 1),
('First Layer Algorithms', 'Learn fundamental algorithms for solving the first layer', 'Beginner', 2),
('Second Layer Techniques', 'Master the second layer solving techniques', 'Intermediate', 3),
('Third Layer Fundamentals', 'Complete the cube with third layer algorithms', 'Intermediate', 4),
('Advanced Finger Tricks', 'Develop speed techniques and finger tricks', 'Advanced', 5),
('Speedcubing Methods', 'Learn speedcubing-specific methods and optimizations', 'Advanced', 6),
('Blind Solving Intro', 'Introduction to blindfolded solving', 'Advanced', 7),
('One-Handed Solving', 'Learn one-handed cubing techniques', 'Advanced', 8)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 13. CREATE FINANCIAL SUMMARY VIEW (Company Level)
-- ============================================================================
CREATE OR REPLACE VIEW ceo_financial_dashboard AS
SELECT
  COUNT(DISTINCT s.id) AS total_active_students,
  COUNT(DISTINCT sc.id) AS total_schools,
  COUNT(DISTINCT t.id) AS total_areas,
  COALESCE(SUM(i.amount), 0) AS company_monthly_revenue,
  COALESCE(SUM(pt.amount), 0) AS recorded_revenue,
  COALESCE(SUM(i.amount), 0) - COALESCE(SUM(pt.amount), 0) AS outstanding_payments,
  ROUND((COALESCE(SUM(pt.amount), 0) / NULLIF(SUM(i.amount), 0) * 100)::numeric, 2) AS payment_collection_pct,
  (SELECT COUNT(*) FROM terms WHERE status = 'active') AS active_terms,
  (SELECT name FROM terms WHERE status = 'active' LIMIT 1) AS current_term
FROM students s
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN areas t ON sc.area = t.name
LEFT JOIN invoices i ON s.id = i.student_id
LEFT JOIN payment_transactions pt ON s.id = pt.student_id;

-- ============================================================================
-- 14. CREATE SCHOOL FINANCIAL PERFORMANCE VIEW
-- ============================================================================
CREATE OR REPLACE VIEW school_financial_performance AS
SELECT
  sc.id,
  sc.name,
  sc.area,
  sc.term_fee_per_student,
  COUNT(DISTINCT s.id) AS current_students,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) AS active_students,
  COUNT(DISTINCT CASE WHEN s.payment_status = 'paid' THEN s.id END) AS paid_students,
  (sc.term_fee_per_student * COUNT(DISTINCT s.id)) AS expected_term_revenue,
  COALESCE(SUM(pt.amount), 0) AS recorded_revenue,
  (sc.term_fee_per_student * COUNT(DISTINCT s.id)) - COALESCE(SUM(pt.amount), 0) AS outstanding_amount,
  ROUND((COALESCE(SUM(pt.amount), 0) / NULLIF(sc.term_fee_per_student * COUNT(DISTINCT s.id), 0) * 100)::numeric, 2) AS revenue_realization_pct
FROM schools sc
LEFT JOIN students s ON sc.id = s.school_id
LEFT JOIN payment_transactions pt ON s.id = pt.student_id
GROUP BY sc.id, sc.name, sc.area, sc.term_fee_per_student;

-- ============================================================================
-- 15. CREATE AREA FINANCIAL PERFORMANCE VIEW
-- ============================================================================
CREATE OR REPLACE VIEW area_financial_performance AS
SELECT
  a.id,
  a.name,
  COUNT(DISTINCT s.id) AS total_students,
  COUNT(DISTINCT sc.id) AS total_schools,
  COALESCE(SUM(i.amount), 0) AS current_month_revenue,
  COALESCE(SUM(pt.amount), 0) AS recorded_revenue,
  COALESCE(SUM(i.amount), 0) - COALESCE(SUM(pt.amount), 0) AS outstanding_amount,
  ROUND((COALESCE(SUM(pt.amount), 0) / NULLIF(SUM(i.amount), 0) * 100)::numeric, 2) AS payment_collection_pct
FROM areas a
LEFT JOIN schools sc ON a.name = sc.area
LEFT JOIN students s ON sc.id = s.school_id
LEFT JOIN invoices i ON s.id = i.student_id
LEFT JOIN payment_transactions pt ON s.id = pt.student_id
GROUP BY a.id, a.name;

-- ============================================================================
-- 16. CREATE ENROLLMENT TRACKING VIEW
-- ============================================================================
CREATE OR REPLACE VIEW term_enrollment_summary AS
SELECT
  t.id AS term_id,
  t.name AS term_name,
  t.year,
  t.status,
  COUNT(DISTINCT se.student_id) AS total_enrollments,
  COUNT(DISTINCT sc.id) AS schools_participating,
  COALESCE(SUM(se.term_fee * COUNT(DISTINCT se.student_id))::numeric, 0) AS projected_revenue
FROM terms t
LEFT JOIN student_enrollments se ON t.id = se.term_id
LEFT JOIN schools sc ON se.school_id = sc.id
GROUP BY t.id, t.name, t.year, t.status;

-- ============================================================================
-- 17. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_term_id ON student_enrollments(term_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_term_id ON invoices(term_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student_id ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_student_id ON progress_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_term_id ON progress_logs(term_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_student_id ON module_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_module_id ON module_completions(module_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);

-- ============================================================================
-- 18. ENABLE ROW LEVEL SECURITY (Optional)
-- ============================================================================
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 19. SAMPLE TERMS DATA (For Testing)
-- ============================================================================
INSERT INTO terms (name, year, quarter_or_term, start_date, end_date, status, description) VALUES
(
  'Term 1 2025',
  2025,
  'Term 1',
  '2025-01-01'::DATE,
  '2025-03-31'::DATE,
  'active',
  'First term of 2025 academic year'
),
(
  'Term 2 2025',
  2025,
  'Term 2',
  '2025-04-01'::DATE,
  '2025-06-30'::DATE,
  'upcoming',
  'Second term of 2025 academic year'
),
(
  'Term 3 2025',
  2025,
  'Term 3',
  '2025-07-01'::DATE,
  '2025-09-30'::DATE,
  'upcoming',
  'Third term of 2025 academic year'
),
(
  'Term 4 2025',
  2025,
  'Term 4',
  '2025-10-01'::DATE,
  '2025-12-31'::DATE,
  'upcoming',
  'Fourth term of 2025 academic year'
)
ON CONFLICT (name) DO NOTHING;
