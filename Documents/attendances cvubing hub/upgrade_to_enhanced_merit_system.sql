-- OPTIONAL UPGRADE: Enhanced Merit System
-- Run this if you want to upgrade from basic merit system to enhanced character development system
-- WARNING: This will modify your existing merit_points table structure

-- First, let's check if columns already exist
DO $$ 
BEGIN
    -- Add new columns to existing merit_points table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merit_points' AND column_name = 'sticker_category') THEN
        ALTER TABLE merit_points ADD COLUMN sticker_category TEXT CHECK (sticker_category IN (
            'persistence_power', 'leadership_light', 'problem_solver', 'community_builder'
        ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merit_points' AND column_name = 'sticker_type') THEN
        ALTER TABLE merit_points ADD COLUMN sticker_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merit_points' AND column_name = 'activity_type') THEN
        ALTER TABLE merit_points ADD COLUMN activity_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merit_points' AND column_name = 'session_date') THEN
        ALTER TABLE merit_points ADD COLUMN session_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merit_points' AND column_name = 'awarded_by') THEN
        ALTER TABLE merit_points ADD COLUMN awarded_by UUID REFERENCES coaches(id);
    END IF;
END $$;

-- Create the merit stickers and badges tables if they don't exist
CREATE TABLE IF NOT EXISTS merit_stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN (
        'persistence_power', 'leadership_light', 'problem_solver', 'community_builder'
    )),
    sticker_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL,
    points_value INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(category, sticker_type)
);

CREATE TABLE IF NOT EXISTS merit_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT,
    requirements_met TEXT,
    awarded_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    term_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert predefined stickers if table is empty
INSERT INTO merit_stickers (category, sticker_type, display_name, description, emoji, points_value) 
SELECT * FROM (VALUES
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
    ('community_builder', 'celebration_champion', 'Celebration Champion', 'For genuinely celebrating others success', '🎉', 3)
) AS v(category, sticker_type, display_name, description, emoji, points_value)
WHERE NOT EXISTS (SELECT 1 FROM merit_stickers);

-- Enable RLS for new tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merit_stickers') THEN
        ALTER TABLE merit_stickers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Enable all operations for merit_stickers" ON merit_stickers;
        CREATE POLICY "Enable all operations for merit_stickers" ON merit_stickers FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merit_badges') THEN
        ALTER TABLE merit_badges ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Enable all operations for merit_badges" ON merit_badges;
        CREATE POLICY "Enable all operations for merit_badges" ON merit_badges FOR ALL USING (true);
    END IF;
END $$;

-- Create helpful views
CREATE OR REPLACE VIEW student_merit_summary AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    c.name as class_name,
    c.id as class_id,
    -- Total points by category (works with both basic and enhanced schema)
    COALESCE(SUM(CASE 
        WHEN mp.sticker_category = 'persistence_power' OR mp.category ILIKE '%persistence%' 
        THEN mp.points END), 0) as persistence_points,
    COALESCE(SUM(CASE 
        WHEN mp.sticker_category = 'leadership_light' OR mp.category ILIKE '%leadership%' 
        THEN mp.points END), 0) as leadership_points,
    COALESCE(SUM(CASE 
        WHEN mp.sticker_category = 'problem_solver' OR mp.category ILIKE '%problem%' 
        THEN mp.points END), 0) as problem_solver_points,
    COALESCE(SUM(CASE 
        WHEN mp.sticker_category = 'community_builder' OR mp.category ILIKE '%community%' 
        THEN mp.points END), 0) as community_builder_points,
    -- Total overall points
    COALESCE(SUM(mp.points), 0) as total_points,
    -- Total merit count
    COUNT(mp.id) as total_merits
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN merit_points mp ON s.id = mp.student_id
GROUP BY s.id, s.name, c.name, c.id;

GRANT SELECT ON student_merit_summary TO authenticated;

-- Verification
SELECT 'Enhanced merit system upgrade completed!' as status;
SELECT 'Merit stickers available: ' || COUNT(*) as sticker_count FROM merit_stickers;