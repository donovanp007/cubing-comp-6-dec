-- =============================================
-- TIER THRESHOLDS TABLE
-- Defines time ranges and point values for each tier
-- Allows per-event-type customization (3x3, 2x2, etc.)
-- =============================================

CREATE TABLE IF NOT EXISTS tier_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL CHECK(tier_name IN ('S', 'A', 'B', 'C', 'D')),
  tier_display_name TEXT NOT NULL, -- 'Elite', 'Advanced', 'Intermediate', 'Beginner', 'Attempt'
  min_time_milliseconds INTEGER, -- NULL for tier S (no lower bound)
  max_time_milliseconds INTEGER, -- NULL for tier D (no upper bound)
  base_points INTEGER NOT NULL, -- Points before grade multiplier
  color_hex TEXT, -- For visual display (#FFD700, #C0C0C0, etc.)
  sort_order INTEGER NOT NULL,
  description TEXT, -- Human-readable description of the tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_type_id, tier_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tier_thresholds_event_type ON tier_thresholds(event_type_id);
CREATE INDEX IF NOT EXISTS idx_tier_thresholds_sort ON tier_thresholds(event_type_id, sort_order);

-- Enable RLS
ALTER TABLE tier_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tier thresholds" ON tier_thresholds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage thresholds" ON tier_thresholds
  FOR ALL USING (auth.role() = 'authenticated');
