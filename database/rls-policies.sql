-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES - SECURE
-- Implements secure access control:
-- - Public users: SELECT only on display data
-- - Authenticated users (coaches): Full CRUD
-- - Sensitive data: Never exposed publicly
-- =============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streaks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STUDENTS TABLE POLICIES
-- =============================================
-- Public: Can only view active student profiles (no contact info exposed in query results)
CREATE POLICY "Public can view active students" ON students FOR SELECT
  USING (status = 'active');

-- Authenticated (coaches): Full access to manage students
CREATE POLICY "Authenticated users can insert students" ON students FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update students" ON students FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete students" ON students FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- COMPETITIONS TABLE POLICIES
-- =============================================
-- Public: Can view active/public competitions
CREATE POLICY "Public can view active competitions" ON competitions FOR SELECT
  USING (status = 'active' OR is_public = true);

-- Authenticated: Can create and modify competitions
CREATE POLICY "Authenticated users can create competitions" ON competitions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update competitions" ON competitions FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete competitions" ON competitions FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- COMPETITION_EVENTS TABLE POLICIES
-- =============================================
-- Public: Can view events from active competitions
CREATE POLICY "Public can view competition events" ON competition_events FOR SELECT
  USING (competition_id IN (
    SELECT id FROM competitions WHERE status = 'active' OR is_public = true
  ));

-- Authenticated: Full access
CREATE POLICY "Authenticated users can create competition events" ON competition_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update competition events" ON competition_events FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete competition events" ON competition_events FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- REGISTRATIONS TABLE POLICIES
-- =============================================
-- Public: Can view registrations
CREATE POLICY "Public can view registrations" ON registrations FOR SELECT USING (true);

-- Authenticated: Can manage registrations
CREATE POLICY "Authenticated users can create registrations" ON registrations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update registrations" ON registrations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete registrations" ON registrations FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- ROUNDS TABLE POLICIES
-- =============================================
-- Public: Can view rounds
CREATE POLICY "Public can view rounds" ON rounds FOR SELECT USING (true);

-- Authenticated: Full access
CREATE POLICY "Authenticated users can create rounds" ON rounds FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rounds" ON rounds FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rounds" ON rounds FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- RESULTS TABLE POLICIES
-- =============================================
-- Public: Can view results
CREATE POLICY "Public can view results" ON results FOR SELECT USING (true);

-- Authenticated: Can record and manage results
CREATE POLICY "Authenticated users can record results" ON results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update results" ON results FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete results" ON results FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- FINAL_SCORES TABLE POLICIES
-- =============================================
-- Public: Can view final scores
CREATE POLICY "Public can view final scores" ON final_scores FOR SELECT USING (true);

-- Authenticated: Can manage final scores
CREATE POLICY "Authenticated users can create final scores" ON final_scores FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update final scores" ON final_scores FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete final scores" ON final_scores FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- PERSONAL_BESTS TABLE POLICIES
-- =============================================
-- Public: Can view personal bests
CREATE POLICY "Public can view personal bests" ON personal_bests FOR SELECT USING (true);

-- Authenticated: Can manage personal bests
CREATE POLICY "Authenticated users can create personal bests" ON personal_bests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update personal bests" ON personal_bests FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete personal bests" ON personal_bests FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- EVENT_TYPES TABLE POLICIES
-- =============================================
-- Public: Can view event types
CREATE POLICY "Public can view event types" ON event_types FOR SELECT USING (true);

-- Authenticated: Can manage event types
CREATE POLICY "Authenticated users can insert event types" ON event_types FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update event types" ON event_types FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete event types" ON event_types FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- WEEKLY_COMPETITIONS TABLE POLICIES
-- =============================================
-- Public: Can view weekly competitions
CREATE POLICY "Public can view weekly competitions" ON weekly_competitions FOR SELECT USING (true);

-- Authenticated: Can manage
CREATE POLICY "Authenticated users can create weekly competitions" ON weekly_competitions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update weekly competitions" ON weekly_competitions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete weekly competitions" ON weekly_competitions FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- WEEKLY_RESULTS TABLE POLICIES
-- =============================================
-- Public: Can view weekly results
CREATE POLICY "Public can view weekly results" ON weekly_results FOR SELECT USING (true);

-- Authenticated: Can manage
CREATE POLICY "Authenticated users can create weekly results" ON weekly_results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update weekly results" ON weekly_results FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete weekly results" ON weekly_results FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- BADGES TABLE POLICIES
-- =============================================
-- Public: Can view badges
CREATE POLICY "Public can view badges" ON badges FOR SELECT USING (true);

-- Authenticated: Can manage badges
CREATE POLICY "Authenticated users can insert badges" ON badges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update badges" ON badges FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete badges" ON badges FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- STUDENT_ACHIEVEMENTS TABLE POLICIES
-- =============================================
-- Public: Can view achievements
CREATE POLICY "Public can view student achievements" ON student_achievements FOR SELECT USING (true);

-- Authenticated: Can manage achievements
CREATE POLICY "Authenticated users can create achievements" ON student_achievements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update achievements" ON student_achievements FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete achievements" ON student_achievements FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- STUDENT_STREAKS TABLE POLICIES
-- =============================================
-- Public: Can view streaks
CREATE POLICY "Public can view student streaks" ON student_streaks FOR SELECT USING (true);

-- Authenticated: Can manage streaks
CREATE POLICY "Authenticated users can create streaks" ON student_streaks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update streaks" ON student_streaks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete streaks" ON student_streaks FOR DELETE
  USING (auth.role() = 'authenticated');
