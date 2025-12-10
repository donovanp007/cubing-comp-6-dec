-- =============================================
-- CUBING HUB COMPETITION MANAGEMENT SYSTEM
-- Complete Database Schema
-- =============================================

-- Students/Competitors
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  school TEXT,
  grade TEXT,
  student_class TEXT,  -- Class/house for team competitions (e.g., "5A", "6B", "Blue House")
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  profile_image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Types (2x2, 3x3, 4x4, Pyraminx, etc.)
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  format TEXT DEFAULT 'ao5',
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions (Big Events)
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  competition_date DATE NOT NULL,
  competition_time TIME,
  registration_deadline DATE,
  max_participants INTEGER,
  status TEXT DEFAULT 'upcoming',
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition Events
CREATE TABLE IF NOT EXISTS competition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id),
  scheduled_time TIMESTAMPTZ,
  max_participants INTEGER,
  status TEXT DEFAULT 'scheduled',
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, event_type_id)
);

-- Rounds
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_event_id UUID REFERENCES competition_events(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_name TEXT NOT NULL,
  cutoff_percentage DECIMAL(5,2),
  cutoff_count INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_event_id, round_number)
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, student_id)
);

-- Results (Individual Solves)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 5),
  time_milliseconds INTEGER,
  is_dnf BOOLEAN DEFAULT false,
  is_dns BOOLEAN DEFAULT false,
  penalty_seconds INTEGER DEFAULT 0,
  scramble TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID,
  UNIQUE(round_id, student_id, attempt_number)
);

-- Final Scores
CREATE TABLE IF NOT EXISTS final_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  best_time_milliseconds INTEGER,
  average_time_milliseconds INTEGER,
  final_ranking INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, student_id)
);

-- Personal Bests
CREATE TABLE IF NOT EXISTS personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id),
  best_single_milliseconds INTEGER,
  best_single_competition_id UUID REFERENCES competitions(id),
  best_single_date DATE,
  best_average_milliseconds INTEGER,
  best_average_competition_id UUID REFERENCES competitions(id),
  best_average_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, event_type_id)
);

-- =============================================
-- WEEKLY COMPETITIONS (TERM-TIME ENGAGEMENT)
-- =============================================

-- Weekly Competitions
CREATE TABLE IF NOT EXISTS weekly_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  event_type_id UUID REFERENCES event_types(id),
  grade_filter TEXT[],
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Results
CREATE TABLE IF NOT EXISTS weekly_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_competition_id UUID REFERENCES weekly_competitions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  attempt_1 INTEGER,
  attempt_2 INTEGER,
  attempt_3 INTEGER,
  attempt_4 INTEGER,
  attempt_5 INTEGER,
  dnf_1 BOOLEAN DEFAULT false,
  dnf_2 BOOLEAN DEFAULT false,
  dnf_3 BOOLEAN DEFAULT false,
  dnf_4 BOOLEAN DEFAULT false,
  dnf_5 BOOLEAN DEFAULT false,
  best_time INTEGER,
  average_time INTEGER,
  ranking INTEGER,
  is_pb BOOLEAN DEFAULT false,
  improvement_percent DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekly_competition_id, student_id)
);

-- =============================================
-- BADGES & ACHIEVEMENTS
-- =============================================

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common',
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Achievements
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  weekly_competition_id UUID REFERENCES weekly_competitions(id),
  competition_id UUID REFERENCES competitions(id),
  UNIQUE(student_id, badge_id)
);

-- Student Streaks
CREATE TABLE IF NOT EXISTS student_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, streak_type)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(competition_date);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_results_round ON results(round_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_results_competition ON weekly_results(weekly_competition_id);
CREATE INDEX IF NOT EXISTS idx_weekly_results_student ON weekly_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);

-- =============================================
-- SEED DATA: Event Types
-- =============================================

INSERT INTO event_types (name, display_name, description, format, sort_order) VALUES
('3x3x3', 'Rubik''s Cube', 'Standard 3x3x3 Rubik''s Cube', 'ao5', 1),
('2x2x2', 'Pocket Cube', '2x2x2 Pocket Cube', 'ao5', 2),
('4x4x4', 'Rubik''s Revenge', '4x4x4 Cube', 'ao5', 3),
('5x5x5', 'Professor''s Cube', '5x5x5 Cube', 'ao5', 4),
('Pyraminx', 'Pyraminx', 'Tetrahedron-shaped puzzle', 'ao5', 5),
('Megaminx', 'Megaminx', 'Dodecahedron-shaped puzzle', 'ao5', 6),
('Skewb', 'Skewb', 'Corner-turning cube', 'ao5', 7),
('Square-1', 'Square-1', 'Shape-shifting puzzle', 'ao5', 8)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED DATA: Badges
-- =============================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points) VALUES
-- Participation Badges
('First Timer', 'Completed your first weekly competition', '🎯', 'participation', 'total_competitions', 1, 'common', 10),
('Regular', 'Participated in 5 weekly competitions', '🎖️', 'participation', 'total_competitions', 5, 'common', 25),
('Dedicated', 'Participated in 10 weekly competitions', '🏅', 'participation', 'total_competitions', 10, 'uncommon', 50),
('Veteran', 'Participated in 25 weekly competitions', '🎗️', 'participation', 'total_competitions', 25, 'rare', 100),
-- Streak Badges
('On Fire', 'Maintained a 3-week participation streak', '🔥', 'streak', 'participation_streak', 3, 'common', 30),
('Unstoppable', 'Maintained a 5-week participation streak', '⚡', 'streak', 'participation_streak', 5, 'uncommon', 60),
('Legend', 'Maintained a 10-week participation streak', '👑', 'streak', 'participation_streak', 10, 'legendary', 150),
-- Achievement Badges
('Podium Finish', 'Finished in top 3 of a weekly competition', '🥉', 'achievement', 'podium_finishes', 1, 'uncommon', 40),
('Champion', 'Won 1st place in a weekly competition', '🏆', 'achievement', 'first_places', 1, 'rare', 75),
('Personal Best', 'Set a new personal best time', '⭐', 'achievement', 'personal_bests', 1, 'common', 20),
-- Improvement Badges
('Getting Better', 'Improved time by 10% from previous week', '📈', 'improvement', 'improvement_10', 1, 'common', 15),
('Major Progress', 'Improved time by 25% from previous week', '🚀', 'improvement', 'improvement_25', 1, 'uncommon', 35),
('Breakthrough', 'Improved time by 50% from previous week', '💪', 'improvement', 'improvement_50', 1, 'rare', 75),
-- Speed Badges
('Sub-30', 'Achieved a single solve under 30 seconds (3x3)', '⚡', 'speed', 'sub_30', 1, 'uncommon', 50),
('Sub-20', 'Achieved a single solve under 20 seconds (3x3)', '🌟', 'speed', 'sub_20', 1, 'rare', 100),
('Sub-15', 'Achieved a single solve under 15 seconds (3x3)', '👑', 'speed', 'sub_15', 1, 'legendary', 200)
ON CONFLICT (name) DO NOTHING;
