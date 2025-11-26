-- ============================================================================
-- SIMPLE MIGRATIONS - TABLES ONLY (No indexes or RLS yet)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. EVENT ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS event_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL,
  competition_event_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OVERALL RANKINGS TABLE
CREATE TABLE IF NOT EXISTS overall_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  event_id UUID,
  student_id UUID NOT NULL,
  placement_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPETITION GROUPS TABLE
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

-- 4. GROUP ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL,
  student_id UUID NOT NULL,
  group_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FINAL SCORES TABLE
CREATE TABLE IF NOT EXISTS final_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  round_id UUID NOT NULL,
  best_time INTEGER,
  average_time INTEGER,
  is_dnf BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMPETITIONS TABLE ENHANCEMENTS
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_event_id UUID;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS live_round_id UUID;
