-- =============================================
-- COMPETITION ENHANCEMENTS SCHEMA
-- Event-specific enrollment + Auto-ranking system
-- =============================================

-- 1. EVENT ENROLLMENTS TABLE
-- Tracks which events each student is registered for
CREATE TABLE IF NOT EXISTS event_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  competition_event_id UUID REFERENCES competition_events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed',  -- confirmed, checked_in, scratched
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(registration_id, competition_event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_enrollments_registration ON event_enrollments(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_enrollments_event ON event_enrollments(competition_event_id);
CREATE INDEX IF NOT EXISTS idx_event_enrollments_student ON event_enrollments(student_id);

-- 2. COMPETITIONS TABLE ENHANCEMENTS
-- Add live status tracking
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_event_id UUID REFERENCES competition_events(id);
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_round_id UUID REFERENCES rounds(id);

CREATE INDEX IF NOT EXISTS idx_competitions_is_live ON competitions(is_live);
CREATE INDEX IF NOT EXISTS idx_competitions_live_event ON competitions(live_event_id);

-- 3. OVERALL RANKINGS TABLE
-- Stores competition-wide rankings across all events
CREATE TABLE IF NOT EXISTS overall_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  final_ranking INTEGER NOT NULL,
  best_time_milliseconds INTEGER,
  average_time_milliseconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, event_type_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_overall_rankings_competition ON overall_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_event ON overall_rankings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_student ON overall_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_ranking ON overall_rankings(competition_id, final_ranking);

-- 4. ROW LEVEL SECURITY POLICIES

-- Event Enrollments RLS
ALTER TABLE event_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event enrollments are publicly readable" ON event_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create event enrollments" ON event_enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update event enrollments" ON event_enrollments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete event enrollments" ON event_enrollments
  FOR DELETE USING (true);

-- Overall Rankings RLS
ALTER TABLE overall_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Overall rankings are publicly readable" ON overall_rankings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create overall rankings" ON overall_rankings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update overall rankings" ON overall_rankings
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete overall rankings" ON overall_rankings
  FOR DELETE USING (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Ensure competitions table has is_live column (if not already added)
-- This is already handled by ALTER TABLE above

COMMIT;
