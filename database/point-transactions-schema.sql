-- =============================================
-- POINT TRANSACTIONS TABLE
-- Complete audit trail of how students earn points
-- Records each point source: best time, average, bonuses
-- =============================================

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  competition_event_id UUID NOT NULL REFERENCES competition_events(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Point type and breakdown
  point_type TEXT NOT NULL CHECK(point_type IN (
    'best_time',
    'average_time',
    'pb_bonus',
    'clutch_bonus',
    'streak_bonus',
    'school_momentum_bonus'
  )),
  tier_achieved TEXT CHECK(tier_achieved IN ('S', 'A', 'B', 'C', 'D')), -- NULL for bonuses
  base_points INTEGER NOT NULL DEFAULT 0, -- Points before multiplier
  grade_multiplier REAL NOT NULL DEFAULT 1.0, -- Multiplier applied (2.0 for Grade 5, 1.0 for Grade 12)
  final_points REAL NOT NULL, -- base_points * grade_multiplier + any adjustments

  -- Context about what earned these points
  time_milliseconds INTEGER, -- The actual time that earned these points
  is_average BOOLEAN DEFAULT false, -- True if this is average time points, false if best time

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one entry per type per student per round
  UNIQUE(round_id, student_id, point_type)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_point_transactions_school ON point_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_competition ON point_transactions(competition_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_student ON point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_round ON point_transactions(round_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_point_type ON point_transactions(point_type);

-- Enable RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view point transactions" ON point_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage transactions" ON point_transactions
  FOR ALL USING (auth.role() = 'authenticated');
