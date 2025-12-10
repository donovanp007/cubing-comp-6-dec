-- CRITICAL GAMIFICATION TABLES - Run this in Supabase SQL Editor
-- These tables are REQUIRED for rankings, points, and leaderboards to work

-- 1. Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  district TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tier Thresholds Table (for time-based tier calculation)
CREATE TABLE IF NOT EXISTS tier_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES event_types(id),
  tier_rank TEXT NOT NULL, -- 'S', 'A', 'B', 'C', 'D'
  max_time_milliseconds INTEGER NOT NULL,
  base_points REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, tier_rank)
);

-- 3. Grade Multipliers Table
CREATE TABLE IF NOT EXISTS grade_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL UNIQUE,
  multiplier REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Point Transactions Table (immutable audit trail)
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  competition_event_id UUID REFERENCES competition_events(id),
  round_id UUID REFERENCES rounds(id),

  -- Point sources
  best_time_points REAL DEFAULT 0,
  average_time_points REAL DEFAULT 0,
  pb_bonus REAL DEFAULT 0,
  clutch_bonus REAL DEFAULT 0,
  streak_bonus REAL DEFAULT 0,
  school_momentum_bonus REAL DEFAULT 0,

  -- Final calculated points
  final_points REAL NOT NULL DEFAULT 0,

  -- Metadata
  tier_rank TEXT,
  grade_multiplier REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, competition_id, competition_event_id, round_id)
);

-- 5. School Standings Table (pre-computed leaderboards)
CREATE TABLE IF NOT EXISTS school_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

  -- Point totals
  total_points REAL NOT NULL DEFAULT 0,
  best_time_points REAL NOT NULL DEFAULT 0,
  average_time_points REAL NOT NULL DEFAULT 0,
  bonus_points REAL NOT NULL DEFAULT 0,

  -- Team metrics
  total_students INTEGER NOT NULL DEFAULT 0,
  average_points_per_student REAL,

  -- Rankings
  overall_rank INTEGER,
  division_rank INTEGER,
  division TEXT,

  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, school_id)
);

-- 6. Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  icon_color TEXT,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Badge Awards Table
CREATE TABLE IF NOT EXISTS badge_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id, competition_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_transactions_student ON point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_school ON point_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_competition ON point_transactions(competition_id);
CREATE INDEX IF NOT EXISTS idx_school_standings_competition ON school_standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_school_standings_rank ON school_standings(competition_id, overall_rank);
CREATE INDEX IF NOT EXISTS idx_badge_awards_student ON badge_awards(student_id);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage schools" ON schools FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view point transactions" ON point_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage points" ON point_transactions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view school standings" ON school_standings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage standings" ON school_standings FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage badges" ON badges FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view badge awards" ON badge_awards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage badge awards" ON badge_awards FOR ALL USING (auth.role() = 'authenticated');
