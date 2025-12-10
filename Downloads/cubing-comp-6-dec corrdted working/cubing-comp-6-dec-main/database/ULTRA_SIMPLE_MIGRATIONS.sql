-- Ultra Simple Migrations - Bare minimum tables only
-- No indexes, no RLS, no constraints

-- 1. Event Enrollments
CREATE TABLE IF NOT EXISTS event_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID,
  competition_event_id UUID,
  student_id UUID,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Overall Rankings
CREATE TABLE IF NOT EXISTS overall_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID,
  event_id UUID,
  student_id UUID,
  placement_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Competition Groups
CREATE TABLE IF NOT EXISTS competition_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID,
  group_name TEXT,
  color_hex TEXT DEFAULT '#808080',
  color_name TEXT DEFAULT 'gray',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Group Assignments
CREATE TABLE IF NOT EXISTS group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID,
  student_id UUID,
  group_id UUID,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Final Scores
CREATE TABLE IF NOT EXISTS final_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID,
  round_id UUID,
  best_time INTEGER,
  average_time INTEGER,
  is_dnf BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add columns to competitions table
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_event_id UUID;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_round_id UUID;
