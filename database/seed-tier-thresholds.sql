-- =============================================
-- SEED: Tier Thresholds for 3x3x3 Event
-- Default time thresholds and point values
-- Admins can customize these per event type
-- =============================================

-- Get the 3x3x3 event type ID (you may need to adjust the name)
-- INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
-- VALUES ((SELECT id FROM event_types WHERE name = '3x3x3'), ...)

-- For 3x3 Cube:
INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1),
  'S',
  'Elite',
  NULL,
  20000,
  10,
  '#FFD700',
  1,
  'Sub 20 seconds - Elite performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1),
  'A',
  'Advanced',
  20000,
  45000,
  5,
  '#C0C0C0',
  2,
  '20-45 seconds - Advanced performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1),
  'B',
  'Intermediate',
  45000,
  60000,
  2,
  '#CD7F32',
  3,
  '45-60 seconds - Intermediate performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1),
  'C',
  'Beginner',
  60000,
  120000,
  1,
  '#4CAF50',
  4,
  '1-2 minutes - Beginner performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1),
  'D',
  'Attempt',
  120000,
  NULL,
  0,
  '#9E9E9E',
  5,
  'Over 2 minutes or DNF - No points'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '3x3x3' OR display_name LIKE '%3x3%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

-- =============================================
-- For 2x2x2 Event (faster times, adjusted thresholds):
-- =============================================

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1),
  'S',
  'Elite',
  NULL,
  10000,
  10,
  '#FFD700',
  1,
  'Sub 10 seconds - Elite performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1),
  'A',
  'Advanced',
  10000,
  15000,
  5,
  '#C0C0C0',
  2,
  '10-15 seconds - Advanced performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1),
  'B',
  'Intermediate',
  15000,
  25000,
  2,
  '#CD7F32',
  3,
  '15-25 seconds - Intermediate performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1),
  'C',
  'Beginner',
  25000,
  60000,
  1,
  '#4CAF50',
  4,
  '25-60 seconds - Beginner performance'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;

INSERT INTO tier_thresholds (event_type_id, tier_name, tier_display_name, min_time_milliseconds, max_time_milliseconds, base_points, color_hex, sort_order, description)
SELECT
  (SELECT id FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1),
  'D',
  'Attempt',
  60000,
  NULL,
  0,
  '#9E9E9E',
  5,
  'Over 60 seconds or DNF - No points'
WHERE EXISTS (SELECT 1 FROM event_types WHERE name = '2x2x2' OR display_name LIKE '%2x2%' LIMIT 1)
ON CONFLICT (event_type_id, tier_name) DO NOTHING;
