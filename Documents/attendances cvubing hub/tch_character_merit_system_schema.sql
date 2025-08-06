-- TCH CHARACTER DEVELOPMENT MERIT SYSTEM SCHEMA
-- Enhanced merit system with character development stickers and badges

-- Drop existing merit-related tables to rebuild them
DROP TABLE IF EXISTS merit_badges CASCADE;
DROP TABLE IF EXISTS merit_stickers CASCADE;
DROP TABLE IF EXISTS merit_points CASCADE;

-- Create enhanced merit points table with sticker categories
CREATE TABLE merit_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 1,
    sticker_category TEXT NOT NULL CHECK (sticker_category IN (
        'persistence_power',
        'leadership_light', 
        'problem_solver',
        'community_builder'
    )),
    sticker_type TEXT NOT NULL,
    description TEXT,
    awarded_by UUID REFERENCES coaches(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Add session tracking for classroom context
    session_date DATE DEFAULT CURRENT_DATE,
    activity_type TEXT, -- e.g., 'cube_solving', 'group_work', 'helping_others'
    -- Add parent notification tracking
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notification_date TIMESTAMPTZ
);

-- Create sticker definitions table
CREATE TABLE merit_stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN (
        'persistence_power',
        'leadership_light',
        'problem_solver', 
        'community_builder'
    )),
    sticker_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL,
    points_value INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(category, sticker_type)
);

-- Create badges table for special achievements
CREATE TABLE merit_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT,
    requirements_met TEXT, -- JSON or text describing what was achieved
    awarded_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    term_id UUID, -- Link to specific term/period
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert the TCH Character Development Stickers
INSERT INTO merit_stickers (category, sticker_type, display_name, description, emoji, points_value) VALUES
-- Persistence Power Stickers
('persistence_power', 'never_give_up', 'Never Give Up', 'For continuing after multiple failures', '🎯', 3),
('persistence_power', 'try_again_champion', 'Try Again Champion', 'For attempting difficult challenges repeatedly', '🏆', 2),
('persistence_power', 'breakthrough_moment', 'Breakthrough Moment', 'For sudden improvement after struggle', '💡', 5),

-- Leadership Light Stickers  
('leadership_light', 'helper_hero', 'Helper Hero', 'For assisting struggling classmates', '🤝', 4),
('leadership_light', 'teaching_star', 'Teaching Star', 'For explaining concepts to others', '⭐', 5),
('leadership_light', 'encourager_award', 'Encourager Award', 'For lifting others up with words', '💪', 3),

-- Problem-Solver Stickers
('problem_solver', 'detective_cube', 'Detective Cube', 'For systematic problem-solving approach', '🧠', 4),
('problem_solver', 'creative_solution', 'Creative Solution', 'For finding unique ways to solve challenges', '🎨', 5),
('problem_solver', 'calm_under_pressure', 'Calm Under Pressure', 'For staying focused during difficulty', '🧘', 4),

-- Community Builder Stickers
('community_builder', 'kindness_cube', 'Kindness Cube', 'For acts of kindness toward others', '❤️', 3),
('community_builder', 'team_player', 'Team Player', 'For putting group success before personal achievement', '🤝', 4),
('community_builder', 'celebration_champion', 'Celebration Champion', 'For genuinely celebrating others success', '🎉', 3);

-- Create indexes for performance
CREATE INDEX idx_merit_points_student_id ON merit_points(student_id);
CREATE INDEX idx_merit_points_category ON merit_points(sticker_category);
CREATE INDEX idx_merit_points_session_date ON merit_points(session_date);
CREATE INDEX idx_merit_points_created_at ON merit_points(created_at);
CREATE INDEX idx_merit_badges_student_id ON merit_badges(student_id);
CREATE INDEX idx_merit_badges_awarded_date ON merit_badges(awarded_date);

-- Create view for student merit summary
CREATE VIEW student_merit_summary AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    c.name as class_name,
    c.id as class_id,
    -- Total points by category
    COALESCE(SUM(CASE WHEN mp.sticker_category = 'persistence_power' THEN mp.points END), 0) as persistence_points,
    COALESCE(SUM(CASE WHEN mp.sticker_category = 'leadership_light' THEN mp.points END), 0) as leadership_points,
    COALESCE(SUM(CASE WHEN mp.sticker_category = 'problem_solver' THEN mp.points END), 0) as problem_solver_points,
    COALESCE(SUM(CASE WHEN mp.sticker_category = 'community_builder' THEN mp.points END), 0) as community_builder_points,
    -- Total overall points
    COALESCE(SUM(mp.points), 0) as total_points,
    -- Sticker counts by category
    COUNT(CASE WHEN mp.sticker_category = 'persistence_power' THEN 1 END) as persistence_stickers,
    COUNT(CASE WHEN mp.sticker_category = 'leadership_light' THEN 1 END) as leadership_stickers,
    COUNT(CASE WHEN mp.sticker_category = 'problem_solver' THEN 1 END) as problem_solver_stickers,
    COUNT(CASE WHEN mp.sticker_category = 'community_builder' THEN 1 END) as community_builder_stickers,
    -- Total sticker count
    COUNT(mp.id) as total_stickers,
    -- Badge count
    COUNT(mb.id) as total_badges
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN merit_points mp ON s.id = mp.student_id
LEFT JOIN merit_badges mb ON s.id = mb.student_id
GROUP BY s.id, s.name, c.name, c.id;

-- Create leaderboard view
CREATE VIEW merit_leaderboard AS
SELECT 
    sms.*,
    RANK() OVER (PARTITION BY sms.class_id ORDER BY sms.total_points DESC) as class_rank,
    RANK() OVER (ORDER BY sms.total_points DESC) as overall_rank,
    -- Calculate character development balance (how evenly distributed their stickers are)
    (
        CASE 
            WHEN sms.total_stickers = 0 THEN 0
            ELSE (
                4 - (
                    ABS(sms.persistence_stickers - (sms.total_stickers::float / 4)) +
                    ABS(sms.leadership_stickers - (sms.total_stickers::float / 4)) +
                    ABS(sms.problem_solver_stickers - (sms.total_stickers::float / 4)) +
                    ABS(sms.community_builder_stickers - (sms.total_stickers::float / 4))
                ) / sms.total_stickers
            ) * 100
        END
    )::INTEGER as character_balance_score
FROM student_merit_summary sms
ORDER BY sms.total_points DESC;

-- Enable RLS for new tables
ALTER TABLE merit_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE merit_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE merit_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for merit_points" ON merit_points FOR ALL USING (true);
CREATE POLICY "Enable all operations for merit_stickers" ON merit_stickers FOR ALL USING (true);
CREATE POLICY "Enable all operations for merit_badges" ON merit_badges FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON merit_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON merit_stickers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON merit_badges TO authenticated;
GRANT SELECT ON student_merit_summary TO authenticated;
GRANT SELECT ON merit_leaderboard TO authenticated;

-- Insert sample merit points using the new system
INSERT INTO merit_points (student_id, points, sticker_category, sticker_type, description, session_date) VALUES
('550e8400-e29b-41d4-a716-446655440003', 3, 'persistence_power', 'never_give_up', 'Continued practicing cross pattern after 10 failed attempts', CURRENT_DATE - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440003', 4, 'community_builder', 'kindness_cube', 'Helped younger student with basic cube grip', CURRENT_DATE - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440004', 5, 'leadership_light', 'teaching_star', 'Explained F2L technique to three classmates', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440004', 2, 'persistence_power', 'try_again_champion', 'Attempted advanced algorithm 15 times until successful', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440005', 4, 'problem_solver', 'detective_cube', 'Used systematic approach to solve cube lock-up', CURRENT_DATE - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440005', 3, 'community_builder', 'celebration_champion', 'Genuinely celebrated when teammate achieved PB', CURRENT_DATE),
('550e8400-e29b-41d4-a716-446655440006', 5, 'problem_solver', 'creative_solution', 'Found unique fingertrick for R U R algorithm', CURRENT_DATE - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440007', 4, 'leadership_light', 'helper_hero', 'Assisted three struggling students during timed practice', CURRENT_DATE);

-- Sample badges for achievements
INSERT INTO merit_badges (student_id, badge_type, badge_name, description, requirements_met) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'monthly_champion', 'Persistence Champion', 'Most persistence stickers earned this month', 'Earned 6 persistence stickers in March'),
('550e8400-e29b-41d4-a716-446655440004', 'balanced_character', 'Well-Rounded Character', 'Earned stickers in all 4 categories', 'Achieved stickers in all character development areas'),
('550e8400-e29b-41d4-a716-446655440005', 'problem_solver_expert', 'Master Problem Solver', 'Earned 5+ problem-solving stickers', 'Demonstrated exceptional problem-solving skills');

-- Verification query
SELECT 
    'Merit Stickers Defined:' as info, 
    COUNT(*) as count 
FROM merit_stickers
UNION ALL
SELECT 
    'Sample Merit Points:', 
    COUNT(*) 
FROM merit_points
UNION ALL
SELECT 
    'Sample Badges:', 
    COUNT(*) 
FROM merit_badges;