-- =============================================
-- SCHOOL STANDINGS TABLE
-- Pre-computed aggregates for fast leaderboard display
-- Updated after each round completion
-- =============================================

CREATE TABLE IF NOT EXISTS school_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Point totals
  total_points REAL NOT NULL DEFAULT 0,
  best_time_points REAL NOT NULL DEFAULT 0, -- Sum of best_time point_transactions
  average_time_points REAL NOT NULL DEFAULT 0, -- Sum of average_time point_transactions
  bonus_points REAL NOT NULL DEFAULT 0, -- Sum of all bonus point_transactions

  -- Team metrics
  total_students INTEGER NOT NULL DEFAULT 0, -- Number of students who competed
  average_points_per_student REAL, -- total_points / total_students (for fair small school comparison)
  total_pb_count INTEGER NOT NULL DEFAULT 0, -- Number of PB achievements
  total_dnf_count INTEGER NOT NULL DEFAULT 0, -- Number of DNFs across all students

  -- Rankings
  overall_rank INTEGER, -- 1st, 2nd, 3rd place overall
  division_rank INTEGER, -- Rank within division (A, B, or C)

  -- Improvement tracking
  previous_competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  improvement_percentage REAL, -- Percent change from previous competition

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(competition_id, school_id)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_school_standings_competition ON school_standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_school_standings_rank ON school_standings(competition_id, overall_rank);
CREATE INDEX IF NOT EXISTS idx_school_standings_division_rank ON school_standings(competition_id, division_rank);
CREATE INDEX IF NOT EXISTS idx_school_standings_points ON school_standings(competition_id, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_school_standings_school ON school_standings(school_id);

-- Enable RLS
ALTER TABLE school_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view school standings" ON school_standings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage standings" ON school_standings
  FOR ALL USING (auth.role() = 'authenticated');
