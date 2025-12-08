-- =====================================================
-- RECORD SYSTEM MIGRATIONS
-- Track competition records and personal bests
-- =====================================================

-- 1. Create competition_records table
-- This table tracks the baseline records from the first competition
-- All future records are compared against this baseline
CREATE TABLE IF NOT EXISTS competition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Baseline reference
  baseline_competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,

  -- Student and Event
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,

  -- Record times (from baseline competition)
  record_single_milliseconds INTEGER NOT NULL,
  record_average_milliseconds INTEGER NOT NULL,

  -- Who set the record (for context)
  record_round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,

  -- Metadata
  is_baseline BOOLEAN DEFAULT true, -- true = baseline records from first competition
  record_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Only one record per student per event per competition tier
  UNIQUE(student_id, event_type_id, baseline_competition_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competition_records_student_event
  ON competition_records(student_id, event_type_id);
CREATE INDEX IF NOT EXISTS idx_competition_records_baseline
  ON competition_records(baseline_competition_id);

-- =====================================================

-- 2. Create student_competition_history table
-- Tracks each student's performance across all competitions
-- Used to detect PBs and record breaks
CREATE TABLE IF NOT EXISTS student_competition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  final_score_id UUID REFERENCES final_scores(id) ON DELETE SET NULL,

  -- Performance metrics
  best_single_milliseconds INTEGER,
  best_average_milliseconds INTEGER,
  ranking INTEGER,

  -- Record tracking
  is_record_single BOOLEAN DEFAULT false, -- Beat baseline single record
  is_record_average BOOLEAN DEFAULT false, -- Beat baseline average record
  is_pb_single BOOLEAN DEFAULT false, -- Personal best single
  is_pb_average BOOLEAN DEFAULT false, -- Personal best average

  -- Previous best for comparison
  previous_pb_single_milliseconds INTEGER,
  previous_pb_average_milliseconds INTEGER,

  -- Improvement tracking
  improvement_percent_single DECIMAL(5,2), -- Percentage improvement for single
  improvement_percent_average DECIMAL(5,2), -- Percentage improvement for average

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: One entry per student per competition per event
  UNIQUE(student_id, competition_id, event_type_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_student_comp_history_student
  ON student_competition_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_comp_history_competition
  ON student_competition_history(competition_id);
CREATE INDEX IF NOT EXISTS idx_student_comp_history_record_flags
  ON student_competition_history(is_record_single, is_record_average);
CREATE INDEX IF NOT EXISTS idx_student_comp_history_pb_flags
  ON student_competition_history(is_pb_single, is_pb_average);

-- =====================================================

-- 3. Create achievement_log table
-- Immutable log of all achievements earned (records, PBs, badges)
CREATE TABLE IF NOT EXISTS achievement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement context
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,

  -- Achievement type
  achievement_type TEXT NOT NULL, -- 'record_single', 'record_average', 'pb_single', 'pb_average', 'badge'

  -- Achievement details
  title TEXT NOT NULL, -- e.g., "New Single Record: 18.23s"
  description TEXT,
  achievement_data JSONB, -- Flexible storage for additional data

  -- Performance metrics
  achieved_time_milliseconds INTEGER,
  previous_best_milliseconds INTEGER,
  improvement_percent DECIMAL(5,2),

  -- Badge reference (if applicable)
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,

  -- Timestamps
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Immutable audit trail
  CONSTRAINT achievement_log_immutable CHECK (true) -- Can only be inserted, never updated/deleted
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_achievement_log_student
  ON achievement_log(student_id);
CREATE INDEX IF NOT EXISTS idx_achievement_log_competition
  ON achievement_log(competition_id);
CREATE INDEX IF NOT EXISTS idx_achievement_log_type
  ON achievement_log(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievement_log_achieved_at
  ON achievement_log(achieved_at DESC);

-- =====================================================

-- 4. Update competitions table to mark baseline competition
-- The first competition is the baseline for all future records
ALTER TABLE IF EXISTS competitions
ADD COLUMN IF NOT EXISTS is_baseline_competition BOOLEAN DEFAULT false;

ALTER TABLE IF EXISTS competitions
ADD COLUMN IF NOT EXISTS baseline_set_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_competitions_baseline
  ON competitions(is_baseline_competition);

-- =====================================================

-- 5. Add record tracking columns to final_scores if not already present
ALTER TABLE IF EXISTS final_scores
ADD COLUMN IF NOT EXISTS is_record_breaker BOOLEAN DEFAULT false;

ALTER TABLE IF EXISTS final_scores
ADD COLUMN IF NOT EXISTS is_pb BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_final_scores_record_pb
  ON final_scores(is_record_breaker, is_pb);

-- =====================================================
-- END RECORD SYSTEM MIGRATIONS
-- =====================================================
