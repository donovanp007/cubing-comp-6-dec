-- Additional tables for enhanced gamification system
-- This extends the existing database schema

-- Create achievement categories table
CREATE TABLE achievement_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES achievement_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points_required INTEGER DEFAULT 0,
    badge_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create student achievements table (earned achievements)
CREATE TABLE student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    awarded_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
    UNIQUE(student_id, achievement_id)
);

-- Create progress tracking table for the 4 pillars
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    pillar_name TEXT NOT NULL, -- confidence, leadership, problem_solving, creativity
    current_level INTEGER DEFAULT 1,
    points_in_level INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, pillar_name)
);

-- Create leaderboard rankings table
CREATE TABLE leaderboard_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    ranking_type TEXT NOT NULL, -- overall, weekly, monthly, pillar_specific
    rank_position INTEGER NOT NULL,
    points INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create gamification settings table
CREATE TABLE gamification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    setting_name TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, setting_name)
);

-- Create parent engagement table
CREATE TABLE parent_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL, -- progress_report, achievement_notification, weekly_summary
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    viewed_at TIMESTAMPTZ,
    parent_email TEXT
);

-- Insert default achievement categories
INSERT INTO achievement_categories (name, description, icon, color) VALUES
('Academic Excellence', 'Achievements related to academic performance and learning', '🎓', '#4CAF50'),
('Leadership', 'Achievements for showing leadership qualities', '👑', '#FF9800'),
('Problem Solving', 'Achievements for creative problem-solving skills', '🧩', '#2196F3'),
('Confidence Building', 'Achievements for personal growth and confidence', '💪', '#9C27B0'),
('Collaboration', 'Achievements for working well with others', '🤝', '#00BCD4'),
('Creativity', 'Achievements for creative thinking and innovation', '🎨', '#E91E63'),
('Attendance', 'Achievements for consistent attendance', '📅', '#795548'),
('Participation', 'Achievements for active class participation', '🙋', '#607D8B');

-- Insert default achievements
INSERT INTO achievements (category_id, name, description, icon, points_required) VALUES
-- Academic Excellence
((SELECT id FROM achievement_categories WHERE name = 'Academic Excellence'), 'Quick Learner', 'Mastered a new concept in record time', '⚡', 50),
((SELECT id FROM achievement_categories WHERE name = 'Academic Excellence'), 'Problem Solver', 'Solved 10 complex problems', '🔍', 100),
((SELECT id FROM achievement_categories WHERE name = 'Academic Excellence'), 'Knowledge Master', 'Achieved excellence in all assessments', '👨‍🎓', 200),

-- Leadership
((SELECT id FROM achievement_categories WHERE name = 'Leadership'), 'Team Captain', 'Led a team successfully', '🏆', 75),
((SELECT id FROM achievement_categories WHERE name = 'Leadership'), 'Mentor', 'Helped 5 classmates learn', '🤝', 150),
((SELECT id FROM achievement_categories WHERE name = 'Leadership'), 'Natural Leader', 'Consistently shown leadership qualities', '⭐', 300),

-- Problem Solving
((SELECT id FROM achievement_categories WHERE name = 'Problem Solving'), 'Puzzle Master', 'Solved 25 puzzles', '🧩', 60),
((SELECT id FROM achievement_categories WHERE name = 'Problem Solving'), 'Creative Thinker', 'Found unique solutions to problems', '💡', 120),
((SELECT id FROM achievement_categories WHERE name = 'Problem Solving'), 'Innovation Champion', 'Consistently innovative approaches', '🚀', 250),

-- Confidence Building
((SELECT id FROM achievement_categories WHERE name = 'Confidence Building'), 'Brave Speaker', 'Spoke confidently in front of class', '🎤', 40),
((SELECT id FROM achievement_categories WHERE name = 'Confidence Building'), 'Self Believer', 'Overcame personal challenges', '💪', 80),
((SELECT id FROM achievement_categories WHERE name = 'Confidence Building'), 'Confident Leader', 'Consistently confident in all activities', '🌟', 180),

-- Attendance
((SELECT id FROM achievement_categories WHERE name = 'Attendance'), 'Perfect Week', 'Perfect attendance for one week', '📅', 25),
((SELECT id FROM achievement_categories WHERE name = 'Attendance'), 'Perfect Month', 'Perfect attendance for one month', '🗓️', 100),
((SELECT id FROM achievement_categories WHERE name = 'Attendance'), 'Always Present', 'Perfect attendance for the term', '🏅', 200);

-- Insert default gamification settings
INSERT INTO gamification_settings (school_id, setting_name, setting_value) VALUES
-- These will be updated per school, using a default school_id for now
('00000000-0000-0000-0000-000000000000', 'points_per_level', '100'),
('00000000-0000-0000-0000-000000000000', 'max_level', '10'),
('00000000-0000-0000-0000-000000000000', 'weekly_report_enabled', 'true'),
('00000000-0000-0000-0000-000000000000', 'parent_notifications_enabled', 'true'),
('00000000-0000-0000-0000-000000000000', 'leaderboard_enabled', 'true');

-- Enable RLS for new tables
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable all operations for achievement_categories" ON achievement_categories FOR ALL USING (true);
CREATE POLICY "Enable all operations for achievements" ON achievements FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_achievements" ON student_achievements FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_progress" ON student_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for leaderboard_rankings" ON leaderboard_rankings FOR ALL USING (true);
CREATE POLICY "Enable all operations for gamification_settings" ON gamification_settings FOR ALL USING (true);
CREATE POLICY "Enable all operations for parent_engagement" ON parent_engagement FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement_id ON student_achievements(achievement_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_pillar ON student_progress(pillar_name);
CREATE INDEX idx_leaderboard_rankings_student_id ON leaderboard_rankings(student_id);
CREATE INDEX idx_leaderboard_rankings_class_id ON leaderboard_rankings(class_id);
CREATE INDEX idx_leaderboard_rankings_type ON leaderboard_rankings(ranking_type);
CREATE INDEX idx_parent_engagement_student_id ON parent_engagement(student_id);