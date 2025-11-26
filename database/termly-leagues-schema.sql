-- =============================================
-- TERMLY LEAGUES EXTENSION
-- Rename weekly competitions to termly leagues
-- Add cumulative points and standings
-- =============================================

-- Rename weekly_competitions to termly_leagues (or create as alias)
-- Add league-specific columns
ALTER TABLE weekly_competitions ADD COLUMN IF NOT EXISTS league_name TEXT;
ALTER TABLE weekly_competitions ADD COLUMN IF NOT EXISTS is_termly_league BOOLEAN DEFAULT true;
ALTER TABLE weekly_competitions ADD COLUMN IF NOT EXISTS league_id UUID;

-- New table: Termly Leagues (overall league container)
CREATE TABLE IF NOT EXISTS termly_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- "Term 1 2025 League - 3x3"
  term TEXT NOT NULL,                  -- "Term 1 2025"
  year INTEGER NOT NULL,               -- 2025
  term_number INTEGER NOT NULL,        -- 1, 2, 3, or 4
  event_type_id UUID REFERENCES event_types(id),
  school TEXT,                         -- Optional: school-specific league
  grade_filter TEXT[],                 -- Optional: grade-specific league
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',        -- 'active', 'completed', 'upcoming'
  scoring_system TEXT DEFAULT 'position', -- 'position' (1st=10, 2nd=8, etc) or 'points'
  total_weeks INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table: League Standings (cumulative rankings)
CREATE TABLE IF NOT EXISTS league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES termly_leagues(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Cumulative stats
  total_points INTEGER DEFAULT 0,
  weeks_participated INTEGER DEFAULT 0,
  weeks_competed JSONB DEFAULT '[]'::jsonb,  -- Array of week numbers participated

  -- Position tracking
  current_position INTEGER,            -- 1, 2, 3, etc.
  previous_position INTEGER,
  position_change INTEGER DEFAULT 0,   -- +1, -1, 0

  -- Performance stats
  best_week_position INTEGER,
  best_week_number INTEGER,
  worst_week_position INTEGER,
  average_position DECIMAL(5,2),
  average_time BIGINT,                 -- milliseconds

  -- Personal bests during league
  pb_count INTEGER DEFAULT 0,
  improvement_percent DECIMAL(5,2),

  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(league_id, student_id)
);

-- Link weekly competitions to leagues
ALTER TABLE weekly_competitions ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES termly_leagues(id);

-- New table: League Points History (track week-by-week changes)
CREATE TABLE IF NOT EXISTS league_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES termly_leagues(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  weekly_position INTEGER,
  points_earned INTEGER,
  cumulative_points INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(league_id, week_number, student_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_termly_leagues_term ON termly_leagues(term, status);
CREATE INDEX IF NOT EXISTS idx_termly_leagues_event ON termly_leagues(event_type_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_league ON league_standings(league_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_position ON league_standings(league_id, current_position);
CREATE INDEX IF NOT EXISTS idx_league_points_history_league ON league_points_history(league_id);
CREATE INDEX IF NOT EXISTS idx_league_points_history_week ON league_points_history(league_id, week_number);

-- =============================================
-- SEED DATA: Test Students for Cubing Hub
-- =============================================

INSERT INTO students (first_name, last_name, email, phone, school, grade, student_class, status) VALUES
('Jaden', 'Smith', 'jaden.smith@school.com', '555-0001', 'Central Primary', '5', '5A', 'active'),
('Nelson', 'Johnson', 'nelson.johnson@school.com', '555-0002', 'Central Primary', '6', '6B', 'active'),
('Andrew', 'Williams', 'andrew.williams@school.com', '555-0003', 'Central Primary', '5', '5B', 'active'),
('Zi', 'Chen', 'zi.chen@school.com', '555-0004', 'Central Primary', '6', '6A', 'active')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SEED DATA: Term 1 2025 League (3x3 Cube)
-- =============================================

-- Insert the league (you'll need to get the event_type_id for 3x3)
-- This is a placeholder - adjust the event_type_id after checking event_types table
INSERT INTO termly_leagues (
  name, term, year, term_number, event_type_id, school,
  description, start_date, end_date, status, scoring_system, total_weeks
) VALUES (
  'Term 1 2025 League - 3x3x3',
  'Term 1 2025',
  2025,
  1,
  (SELECT id FROM event_types WHERE name = '3x3x3' LIMIT 1),
  'Central Primary',
  'Weekly 3x3 cube competition throughout Term 1',
  '2025-01-27',
  '2025-03-21',
  'active',
  'position',
  8
)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- RLS POLICIES FOR TERMLY LEAGUES
-- =============================================

ALTER TABLE termly_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_points_history ENABLE ROW LEVEL SECURITY;

-- Termly Leagues: Public read, admin write
CREATE POLICY "Termly leagues are publicly readable" ON termly_leagues FOR SELECT USING (true);
CREATE POLICY "Anyone can create termly leagues" ON termly_leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update termly leagues" ON termly_leagues FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete termly leagues" ON termly_leagues FOR DELETE USING (true);

-- League Standings: Public read, system write
CREATE POLICY "League standings are publicly readable" ON league_standings FOR SELECT USING (true);
CREATE POLICY "Anyone can create league standings" ON league_standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update league standings" ON league_standings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete league standings" ON league_standings FOR DELETE USING (true);

-- League Points History: Public read, system write
CREATE POLICY "League points history is publicly readable" ON league_points_history FOR SELECT USING (true);
CREATE POLICY "Anyone can record league points" ON league_points_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update league points" ON league_points_history FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete league points" ON league_points_history FOR DELETE USING (true);
