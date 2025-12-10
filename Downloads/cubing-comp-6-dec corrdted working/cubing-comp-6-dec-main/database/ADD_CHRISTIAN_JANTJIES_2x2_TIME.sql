-- =============================================
-- ADD CHRISTIAN JANTJIES 2x2x2 FINAL TIME
-- =============================================
-- This script adds the time 11.23 seconds to attempt 5
-- for Christian Jantjies in the 2x2x2 final

-- Note: This is a template script. You need to:
-- 1. Find the correct IDs for:
--    - Student: Christian Jantjies (search by first_name='Christian', last_name='Jantjies')
--    - Competition: The one containing the 2x2x2 final
--    - Event: 2x2x2 (Pocket Cube)
--    - Round: The final round of that event
-- 2. Replace the UUIDs below with actual values from your database
-- 3. Run the script in Supabase SQL editor

-- =============================================
-- STEP 1: Find the correct IDs (run these queries first)
-- =============================================

-- Find Christian Jantjies
-- SELECT id, first_name, last_name FROM students WHERE first_name = 'Christian' AND last_name = 'Jantjies';

-- Find 2x2x2 event type
-- SELECT id, name, display_name FROM event_types WHERE name = '2x2x2';

-- List competitions with 2x2x2 events
-- SELECT DISTINCT c.id, c.name, c.competition_date
-- FROM competitions c
-- JOIN competition_events ce ON c.id = ce.competition_id
-- JOIN event_types et ON ce.event_type_id = et.id
-- WHERE et.name = '2x2x2'
-- ORDER BY c.competition_date DESC;

-- Find the final round for 2x2x2
-- SELECT r.id, r.round_number, r.round_name
-- FROM rounds r
-- JOIN competition_events ce ON r.competition_event_id = ce.id
-- JOIN event_types et ON ce.event_type_id = et.id
-- WHERE et.name = '2x2x2'
-- ORDER BY r.round_number DESC
-- LIMIT 1;

-- =============================================
-- STEP 2: Replace the UUIDs below and run this insert
-- =============================================

-- Insert the time record (11.23 seconds = 11230 milliseconds)
-- REPLACE THESE UUIDs WITH ACTUAL VALUES
INSERT INTO results (
  round_id,
  student_id,
  attempt_number,
  time_milliseconds,
  is_dnf,
  is_dns,
  penalty_seconds,
  scramble,
  recorded_by
) VALUES (
  '{{ ROUND_ID }}',           -- Replace with actual round ID for 2x2x2 final
  '{{ STUDENT_ID }}',         -- Replace with Christian Jantjies' student ID
  5,                          -- Attempt 5
  11230,                      -- 11.23 seconds in milliseconds
  false,                      -- Not DNF
  false,                      -- Not DNS
  0,                          -- No penalty
  NULL,                       -- Scramble (if available)
  NULL                        -- Recorded by (if tracking who entered it)
)
ON CONFLICT (round_id, student_id, attempt_number)
DO UPDATE SET
  time_milliseconds = 11230,
  updated_at = NOW();

-- =============================================
-- STEP 3: Verify the insert
-- =============================================

-- Check that the time was added
-- SELECT
--   s.first_name,
--   s.last_name,
--   et.display_name as event,
--   r.round_name,
--   res.attempt_number,
--   res.time_milliseconds / 1000.0 as time_seconds
-- FROM results res
-- JOIN students s ON res.student_id = s.id
-- JOIN rounds r ON res.round_id = r.id
-- JOIN competition_events ce ON r.competition_event_id = ce.id
-- JOIN event_types et ON ce.event_type_id = et.id
-- WHERE s.first_name = 'Christian' AND s.last_name = 'Jantjies'
-- AND et.name = '2x2x2'
-- ORDER BY res.attempt_number;
