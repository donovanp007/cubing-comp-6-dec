-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable public read/write access for testing
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
CREATE POLICY "Students are publicly readable" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON students FOR DELETE USING (true);

-- =============================================
-- COMPETITIONS TABLE POLICIES
-- =============================================
CREATE POLICY "Competitions are publicly readable" ON competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can create competitions" ON competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update competitions" ON competitions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete competitions" ON competitions FOR DELETE USING (true);

-- =============================================
-- COMPETITION_EVENTS TABLE POLICIES
-- =============================================
CREATE POLICY "Competition events are publicly readable" ON competition_events FOR SELECT USING (true);
CREATE POLICY "Anyone can create competition events" ON competition_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update competition events" ON competition_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete competition events" ON competition_events FOR DELETE USING (true);

-- =============================================
-- REGISTRATIONS TABLE POLICIES
-- =============================================
CREATE POLICY "Registrations are publicly readable" ON registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can register students" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update registrations" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete registrations" ON registrations FOR DELETE USING (true);

-- =============================================
-- ROUNDS TABLE POLICIES
-- =============================================
CREATE POLICY "Rounds are publicly readable" ON rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can create rounds" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rounds" ON rounds FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rounds" ON rounds FOR DELETE USING (true);

-- =============================================
-- RESULTS TABLE POLICIES
-- =============================================
CREATE POLICY "Results are publicly readable" ON results FOR SELECT USING (true);
CREATE POLICY "Anyone can record results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update results" ON results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete results" ON results FOR DELETE USING (true);

-- =============================================
-- FINAL_SCORES TABLE POLICIES
-- =============================================
CREATE POLICY "Final scores are publicly readable" ON final_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can create final scores" ON final_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update final scores" ON final_scores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete final scores" ON final_scores FOR DELETE USING (true);

-- =============================================
-- PERSONAL_BESTS TABLE POLICIES
-- =============================================
CREATE POLICY "Personal bests are publicly readable" ON personal_bests FOR SELECT USING (true);
CREATE POLICY "Anyone can create personal bests" ON personal_bests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update personal bests" ON personal_bests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete personal bests" ON personal_bests FOR DELETE USING (true);

-- =============================================
-- EVENT_TYPES TABLE POLICIES
-- =============================================
CREATE POLICY "Event types are publicly readable" ON event_types FOR SELECT USING (true);

-- =============================================
-- WEEKLY_COMPETITIONS TABLE POLICIES
-- =============================================
CREATE POLICY "Weekly competitions are publicly readable" ON weekly_competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can create weekly competitions" ON weekly_competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly competitions" ON weekly_competitions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weekly competitions" ON weekly_competitions FOR DELETE USING (true);

-- =============================================
-- WEEKLY_RESULTS TABLE POLICIES
-- =============================================
CREATE POLICY "Weekly results are publicly readable" ON weekly_results FOR SELECT USING (true);
CREATE POLICY "Anyone can create weekly results" ON weekly_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly results" ON weekly_results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weekly results" ON weekly_results FOR DELETE USING (true);

-- =============================================
-- BADGES TABLE POLICIES
-- =============================================
CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);

-- =============================================
-- STUDENT_ACHIEVEMENTS TABLE POLICIES
-- =============================================
CREATE POLICY "Student achievements are publicly readable" ON student_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can create achievements" ON student_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update achievements" ON student_achievements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete achievements" ON student_achievements FOR DELETE USING (true);

-- =============================================
-- STUDENT_STREAKS TABLE POLICIES
-- =============================================
CREATE POLICY "Student streaks are publicly readable" ON student_streaks FOR SELECT USING (true);
CREATE POLICY "Anyone can create streaks" ON student_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update streaks" ON student_streaks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete streaks" ON student_streaks FOR DELETE USING (true);
