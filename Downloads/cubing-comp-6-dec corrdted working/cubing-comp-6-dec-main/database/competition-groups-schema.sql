-- ============================================================================
-- Competition Groups & Live Tracking System
-- Purpose: Add grouping system for students and live solve tracking
-- Status: NEW tables for group management and solve progress
-- ============================================================================

-- ============================================================================
-- 1. COMPETITION GROUPS TABLE
-- ============================================================================
-- Stores group definitions for competitions
-- Each group can have a color, name, and sort order
-- ============================================================================

CREATE TABLE IF NOT EXISTS competition_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,  -- "Group A", "Group 1", "Red Group"
  color_hex TEXT DEFAULT '#808080',  -- Color for visual identification
  color_name TEXT DEFAULT 'gray',  -- Human readable: red, blue, green, etc.
  sort_order INTEGER DEFAULT 0,  -- Display order
  total_students INTEGER DEFAULT 0,  -- Cached count
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(competition_id, group_name),
  CHECK (group_name ~ '^[A-Za-z0-9\s\-]+$'),
  CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- ============================================================================
-- 2. GROUP ASSIGNMENTS TABLE
-- ============================================================================
-- Links students to groups within a competition
-- One student can be in ONE group per competition
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES competition_groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID,  -- Coach who made assignment

  -- One student per group per competition
  UNIQUE(competition_id, student_id),
  UNIQUE(competition_id, group_id, student_id)
);

-- ============================================================================
-- 3. SOLVE PROGRESS TRACKING
-- ============================================================================
-- Updates to results table to track live solve progress
-- ============================================================================

-- Add columns to track live solve progress
ALTER TABLE results ADD COLUMN IF NOT EXISTS solve_started_at TIMESTAMPTZ;
ALTER TABLE results ADD COLUMN IF NOT EXISTS solve_completed_at TIMESTAMPTZ;
ALTER TABLE results ADD COLUMN IF NOT EXISTS judge_notes TEXT;

-- ============================================================================
-- 4. COMPETITION LIVE STATE TABLE
-- ============================================================================
-- Tracks current state of competition during live event
-- Helps with sequencing and round management
-- ============================================================================

CREATE TABLE IF NOT EXISTS competition_live_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL UNIQUE REFERENCES competitions(id) ON DELETE CASCADE,
  current_event_id UUID REFERENCES competition_events(id),
  current_round_id UUID REFERENCES rounds(id),
  current_group_id UUID REFERENCES competition_groups(id),

  -- Current competitor info
  current_student_id UUID REFERENCES students(id),
  current_attempt_number INTEGER DEFAULT 1,  -- 1-5

  -- State
  is_live BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. GROUP COLOR PALETTE
-- ============================================================================
-- Predefined colors for automatic group assignment
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_colors (
  id SERIAL PRIMARY KEY,
  color_name TEXT UNIQUE NOT NULL,
  color_hex TEXT NOT NULL,
  color_rgb TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Insert color palette
INSERT INTO group_colors (color_name, color_hex, color_rgb, display_order) VALUES
  ('red', '#EF4444', 'rgb(239, 68, 68)', 1),
  ('orange', '#F97316', 'rgb(249, 115, 22)', 2),
  ('yellow', '#EAB308', 'rgb(234, 179, 8)', 3),
  ('green', '#22C55E', 'rgb(34, 197, 94)', 4),
  ('blue', '#3B82F6', 'rgb(59, 130, 246)', 5),
  ('purple', '#A855F7', 'rgb(168, 85, 247)', 6),
  ('pink', '#EC4899', 'rgb(236, 72, 153)', 7),
  ('cyan', '#06B6D4', 'rgb(6, 182, 212)', 8)
ON CONFLICT (color_name) DO NOTHING;

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_competition_groups_competition_id
  ON competition_groups(competition_id);

CREATE INDEX IF NOT EXISTS idx_group_assignments_competition_id
  ON group_assignments(competition_id);

CREATE INDEX IF NOT EXISTS idx_group_assignments_student_id
  ON group_assignments(student_id);

CREATE INDEX IF NOT EXISTS idx_group_assignments_group_id
  ON group_assignments(group_id);

CREATE INDEX IF NOT EXISTS idx_competition_live_state_competition_id
  ON competition_live_state(competition_id);

CREATE INDEX IF NOT EXISTS idx_results_solve_progress
  ON results(round_id, student_id, attempt_number)
  WHERE solve_completed_at IS NOT NULL;

-- ============================================================================
-- 7. VIEWS FOR CONVENIENCE
-- ============================================================================

-- View: Get all groups for a competition with student count
CREATE OR REPLACE VIEW competition_groups_with_counts AS
SELECT
  g.id,
  g.competition_id,
  g.group_name,
  g.color_hex,
  g.color_name,
  g.sort_order,
  COUNT(ga.student_id) as student_count,
  g.created_at,
  g.updated_at
FROM competition_groups g
LEFT JOIN group_assignments ga ON g.id = ga.group_id
GROUP BY g.id, g.competition_id, g.group_name, g.color_hex, g.color_name, g.sort_order, g.created_at, g.updated_at;

-- View: Get students with their group assignments
CREATE OR REPLACE VIEW students_with_groups AS
SELECT
  ga.competition_id,
  ga.student_id,
  s.name as student_name,
  g.id as group_id,
  g.group_name,
  g.color_hex,
  g.color_name
FROM group_assignments ga
JOIN students s ON ga.student_id = s.id
JOIN competition_groups g ON ga.group_id = g.id
ORDER BY g.sort_order, s.name;

-- View: Competition live status summary
CREATE OR REPLACE VIEW competition_live_summary AS
SELECT
  cls.competition_id,
  c.name as competition_name,
  cls.is_live,
  cls.current_event_id,
  et.name as current_event_name,
  cls.current_round_id,
  r.round_number,
  cls.current_group_id,
  cg.group_name,
  cls.current_student_id,
  s.name as current_student_name,
  cls.current_attempt_number,
  cls.started_at,
  cls.paused_at
FROM competition_live_state cls
LEFT JOIN competitions c ON cls.competition_id = c.id
LEFT JOIN competition_events ce ON cls.current_event_id = ce.id
LEFT JOIN event_types et ON ce.event_type_id = et.id
LEFT JOIN rounds r ON cls.current_round_id = r.id
LEFT JOIN competition_groups cg ON cls.current_group_id = cg.id
LEFT JOIN students s ON cls.current_student_id = s.id;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on new tables for public testing access
-- ============================================================================

ALTER TABLE competition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_live_state ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for testing
CREATE POLICY "Allow public read" ON competition_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON competition_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON competition_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON competition_groups FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON group_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON group_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON group_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON group_assignments FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON competition_live_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON competition_live_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON competition_live_state FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON competition_live_state FOR DELETE USING (true);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- New features added:
-- ✓ competition_groups - Group management with colors
-- ✓ group_assignments - Student to group mapping
-- ✓ competition_live_state - Live event state tracking
-- ✓ group_colors - Predefined color palette
-- ✓ Indexes for performance
-- ✓ Views for convenience queries
-- ✓ RLS policies for public access
-- ============================================================================
