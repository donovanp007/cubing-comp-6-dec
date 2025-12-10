-- =============================================
-- GRADE MULTIPLIERS TABLE
-- Defines point multipliers per grade level (inverse scale)
-- Grade 5 (2.0x) encourages younger students
-- Grade 12 (1.0x) is baseline
-- =============================================

CREATE TABLE IF NOT EXISTS grade_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade TEXT NOT NULL UNIQUE,
  multiplier REAL NOT NULL DEFAULT 1.0, -- 2.0 for Grade 5, 1.0 for Grade 12
  display_order INTEGER NOT NULL,
  description TEXT, -- Optional explanation of the multiplier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_grade_multipliers_grade ON grade_multipliers(grade);
CREATE INDEX IF NOT EXISTS idx_grade_multipliers_order ON grade_multipliers(display_order);

-- Enable RLS
ALTER TABLE grade_multipliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view grade multipliers" ON grade_multipliers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage multipliers" ON grade_multipliers
  FOR ALL USING (auth.role() = 'authenticated');
