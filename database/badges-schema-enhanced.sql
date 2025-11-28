-- =============================================
-- BADGES TABLE (ENHANCED)
-- Flexible badge system with criteria stored as JSON
-- Supports both individual and school-level achievements
-- =============================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL UNIQUE, -- Machine-readable: 'speed_demon', 'consistency_king', etc.
  badge_name TEXT NOT NULL, -- Human-readable: 'Speed Demon'
  badge_description TEXT, -- Explanation: 'Achieved a sub-20 second solve'
  badge_type TEXT NOT NULL CHECK(badge_type IN ('individual', 'school')), -- Who gets this badge
  icon_url TEXT, -- URL to badge icon/image
  color_hex TEXT, -- Display color (#FFD700, etc.)

  -- Criteria stored as JSON for flexibility
  -- Examples:
  -- {"min_best_time_ms": 20000} for Speed Demon
  -- {"min_consecutive_improvements": 3} for Streak Master
  -- {"zero_dnfs": true} for Consistency King
  -- {"percent_improvement": 15} for Growth Warriors
  criteria_json TEXT NOT NULL,

  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BADGE AWARDS TABLE
-- Records which badges have been awarded to students/schools
-- =============================================

CREATE TABLE IF NOT EXISTS badge_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,

  -- Award recipient (one must be set, one must be null)
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- For individual badges
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- For school badges

  -- Why they got the badge
  awarded_for TEXT, -- Human-readable reason: "Best time: 18.23s"
  awarded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: either student OR school, not both
  CHECK ((student_id IS NOT NULL AND school_id IS NULL) OR (student_id IS NULL AND school_id IS NOT NULL))
);

-- Indexes for badge queries
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(badge_code);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(active);
CREATE INDEX IF NOT EXISTS idx_badge_awards_student ON badge_awards(student_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_school ON badge_awards(school_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_competition ON badge_awards(competition_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_badge ON badge_awards(badge_id);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage badges" ON badges
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view badge awards" ON badge_awards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage awards" ON badge_awards
  FOR ALL USING (auth.role() = 'authenticated');
