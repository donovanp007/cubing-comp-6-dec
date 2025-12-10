-- ============================================================================
-- APPLY ALL MIGRATIONS FOR STREAMLINED BIG COMPETITIONS WORKFLOW
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. EVENT ENROLLMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL,
  competition_event_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_enrollments_registration ON event_enrollments(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_enrollments_event ON event_enrollments(competition_event_id);
CREATE INDEX IF NOT EXISTS idx_event_enrollments_student ON event_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_event_enrollments_unique ON event_enrollments(registration_id, competition_event_id);

-- ============================================================================
-- 2. COMPETITIONS TABLE ENHANCEMENTS
-- ============================================================================
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_event_id UUID;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_round_id UUID;

CREATE INDEX IF NOT EXISTS idx_competitions_is_live ON competitions(is_live);
CREATE INDEX IF NOT EXISTS idx_competitions_live_event ON competitions(live_event_id);

-- ============================================================================
-- 3. OVERALL RANKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS overall_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  event_id UUID,
  student_id UUID NOT NULL,
  placement_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_overall_rankings_competition ON overall_rankings(competition_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_event ON overall_rankings(event_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_student ON overall_rankings(student_id);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_competition_student ON overall_rankings(competition_id, student_id);

-- ============================================================================
-- 4. COMPETITION GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competition_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  group_name TEXT NOT NULL,
  color_hex TEXT DEFAULT '#808080',
  color_name TEXT DEFAULT 'gray',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competition_groups_competition_id ON competition_groups(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_groups_unique ON competition_groups(competition_id, group_name);

-- ============================================================================
-- 5. GROUP ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  student_id UUID NOT NULL,
  group_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_assignments_competition_id ON group_assignments(competition_id);
CREATE INDEX IF NOT EXISTS idx_group_assignments_student_id ON group_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_group_assignments_group_id ON group_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_group_assignments_unique ON group_assignments(competition_id, student_id);

-- ============================================================================
-- 6. FINAL SCORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS final_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  round_id UUID NOT NULL,
  best_time INTEGER,
  average_time INTEGER,
  is_dnf BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_final_scores_student ON final_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_final_scores_round ON final_scores(round_id);
CREATE INDEX IF NOT EXISTS idx_final_scores_student_round ON final_scores(student_id, round_id);

-- ============================================================================
-- 7. ENABLE RLS POLICIES
-- ============================================================================
ALTER TABLE event_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE overall_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_scores ENABLE ROW LEVEL SECURITY;

-- Event Enrollments Policies
DROP POLICY IF EXISTS "Event enrollments are publicly readable" ON event_enrollments;
CREATE POLICY "Event enrollments are publicly readable" ON event_enrollments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create event enrollments" ON event_enrollments;
CREATE POLICY "Anyone can create event enrollments" ON event_enrollments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update event enrollments" ON event_enrollments;
CREATE POLICY "Anyone can update event enrollments" ON event_enrollments FOR UPDATE USING (true);

-- Overall Rankings Policies
DROP POLICY IF EXISTS "Overall rankings are publicly readable" ON overall_rankings;
CREATE POLICY "Overall rankings are publicly readable" ON overall_rankings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create overall rankings" ON overall_rankings;
CREATE POLICY "Anyone can create overall rankings" ON overall_rankings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update overall rankings" ON overall_rankings;
CREATE POLICY "Anyone can update overall rankings" ON overall_rankings FOR UPDATE USING (true);

-- Competition Groups Policies
DROP POLICY IF EXISTS "Groups are publicly readable" ON competition_groups;
CREATE POLICY "Groups are publicly readable" ON competition_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create groups" ON competition_groups;
CREATE POLICY "Anyone can create groups" ON competition_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update groups" ON competition_groups;
CREATE POLICY "Anyone can update groups" ON competition_groups FOR UPDATE USING (true);

-- Group Assignments Policies
DROP POLICY IF EXISTS "Assignments are publicly readable" ON group_assignments;
CREATE POLICY "Assignments are publicly readable" ON group_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create assignments" ON group_assignments;
CREATE POLICY "Anyone can create assignments" ON group_assignments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update assignments" ON group_assignments;
CREATE POLICY "Anyone can update assignments" ON group_assignments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete assignments" ON group_assignments;
CREATE POLICY "Anyone can delete assignments" ON group_assignments FOR DELETE USING (true);

-- Final Scores Policies
DROP POLICY IF EXISTS "Scores are publicly readable" ON final_scores;
CREATE POLICY "Scores are publicly readable" ON final_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create scores" ON final_scores;
CREATE POLICY "Anyone can create scores" ON final_scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update scores" ON final_scores;
CREATE POLICY "Anyone can update scores" ON final_scores FOR UPDATE USING (true);

-- ============================================================================
-- ALL MIGRATIONS COMPLETE
-- ============================================================================
