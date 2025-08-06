-- Curriculum Management Database Schema
-- This extends the existing database schema for coaching workbook integration

-- Create curriculum modules table
CREATE TABLE curriculum_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    module_order INTEGER NOT NULL,
    estimated_duration_minutes INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    pillar_focus TEXT NOT NULL CHECK (pillar_focus IN ('confidence', 'leadership', 'problem_solving', 'creativity')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create curriculum lessons table
CREATE TABLE curriculum_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES curriculum_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    lesson_order INTEGER NOT NULL,
    learning_objectives TEXT[], -- Array of learning objectives
    materials_needed TEXT[], -- Array of required materials
    estimated_duration_minutes INTEGER,
    coaching_notes TEXT, -- Special notes for coaches
    success_metrics TEXT[], -- How to measure success
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create coaching stories table
CREATE TABLE coaching_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    story_type TEXT CHECK (story_type IN ('inspirational', 'educational', 'problem_solving', 'confidence_building')),
    pillar_focus TEXT NOT NULL CHECK (pillar_focus IN ('confidence', 'leadership', 'problem_solving', 'creativity')),
    age_group TEXT CHECK (age_group IN ('elementary', 'middle', 'high')),
    recommended_timing TEXT, -- When to use this story
    key_message TEXT NOT NULL,
    discussion_questions TEXT[], -- Questions to ask after the story
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create class curriculum progress table
CREATE TABLE class_curriculum_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    coach_notes TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    student_engagement_level TEXT CHECK (student_engagement_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(class_id, lesson_id)
);

-- Create student lesson progress table
CREATE TABLE student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    mastery_level TEXT CHECK (mastery_level IN ('not_started', 'developing', 'proficient', 'advanced')),
    pillar_points_earned INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, lesson_id)
);

-- Create coaching activities table
CREATE TABLE coaching_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('individual', 'group', 'pair', 'demonstration')),
    time_allocation_minutes INTEGER,
    materials_required TEXT[],
    setup_instructions TEXT,
    step_by_step_guide TEXT NOT NULL,
    success_indicators TEXT[],
    common_challenges TEXT[],
    adaptation_notes TEXT, -- How to adapt for different skill levels
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create assessment rubrics table
CREATE TABLE assessment_rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    pillar_name TEXT NOT NULL CHECK (pillar_name IN ('confidence', 'leadership', 'problem_solving', 'creativity')),
    criteria_name TEXT NOT NULL,
    level_1_description TEXT NOT NULL, -- Beginning level
    level_2_description TEXT NOT NULL, -- Developing level
    level_3_description TEXT NOT NULL, -- Proficient level
    level_4_description TEXT NOT NULL, -- Advanced level
    weight_percentage INTEGER DEFAULT 25 CHECK (weight_percentage > 0 AND weight_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create student assessments table
CREATE TABLE student_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE CASCADE,
    rubric_id UUID REFERENCES assessment_rubrics(id) ON DELETE CASCADE,
    assessed_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
    achievement_level INTEGER CHECK (achievement_level >= 1 AND achievement_level <= 4),
    assessment_notes TEXT,
    improvement_suggestions TEXT,
    assessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, lesson_id, rubric_id)
);

-- Create parent communication templates table
CREATE TABLE parent_communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('weekly_progress', 'milestone_achieved', 'area_for_improvement', 'celebration')),
    subject_line TEXT NOT NULL,
    template_content TEXT NOT NULL,
    pillar_focus TEXT CHECK (pillar_focus IN ('confidence', 'leadership', 'problem_solving', 'creativity')),
    merge_fields TEXT[], -- Available merge fields like {student_name}, {progress_percentage}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default curriculum modules
INSERT INTO curriculum_modules (title, description, icon, module_order, estimated_duration_minutes, difficulty_level, pillar_focus) VALUES
('Introduction to Confidence Building', 'Building self-assurance and overcoming fear of failure', '💪', 1, 45, 'beginner', 'confidence'),
('Leadership Fundamentals', 'Teaching basic leadership principles and team guidance', '👑', 2, 60, 'beginner', 'leadership'),
('Problem-Solving Strategies', 'Developing systematic approaches to challenges', '🧩', 3, 50, 'intermediate', 'problem_solving'),
('Creative Thinking Workshop', 'Encouraging innovative and out-of-the-box thinking', '🎨', 4, 55, 'intermediate', 'creativity'),
('Advanced Confidence Techniques', 'Public speaking and presentation skills', '🎤', 5, 70, 'advanced', 'confidence'),
('Team Leadership Projects', 'Leading and managing team-based initiatives', '🤝', 6, 80, 'advanced', 'leadership'),
('Complex Problem Analysis', 'Breaking down and solving multi-step problems', '🔍', 7, 65, 'advanced', 'problem_solving'),
('Innovation and Invention', 'Creating new solutions and thinking creatively', '💡', 8, 75, 'advanced', 'creativity');

-- Insert sample lessons for the first module
INSERT INTO curriculum_lessons (module_id, title, content, lesson_order, learning_objectives, materials_needed, estimated_duration_minutes, coaching_notes, success_metrics) VALUES
((SELECT id FROM curriculum_modules WHERE title = 'Introduction to Confidence Building'), 
 'Understanding Fear and Failure', 
 'This lesson helps students understand that failure is a natural part of learning and growth...', 
 1, 
 ARRAY['Identify different types of fears', 'Understand the learning value of failure', 'Develop a growth mindset'], 
 ARRAY['Rubiks cubes', 'Whiteboard', 'Confidence cards'], 
 20, 
 'Start with a personal story about overcoming failure. Be vulnerable to create connection.',
 ARRAY['Students can name 3 benefits of failure', 'Students show willingness to try challenging tasks']);

-- Insert sample coaching stories
INSERT INTO coaching_stories (title, content, story_type, pillar_focus, age_group, recommended_timing, key_message, discussion_questions) VALUES
('The Cube That Taught Me Courage', 
 'When I was 12, I received my first Rubiks cube. I was terrified to even scramble it because I thought I would never solve it again...', 
 'confidence_building', 
 'confidence', 
 'elementary', 
 'Beginning of confidence module', 
 'Taking the first step is often the hardest, but it leads to growth', 
 ARRAY['What stops you from trying new things?', 'How do you feel when you make a mistake?', 'What would you attempt if you knew you could not fail?']);

-- Insert sample activities
INSERT INTO coaching_activities (lesson_id, activity_name, activity_description, activity_type, time_allocation_minutes, materials_required, setup_instructions, step_by_step_guide, success_indicators, common_challenges, adaptation_notes) VALUES
((SELECT id FROM curriculum_lessons WHERE title = 'Understanding Fear and Failure'),
 'Fear Face-Off Challenge',
 'Students identify their fears and work through them systematically',
 'individual',
 15,
 ARRAY['Fear worksheet', 'Colored pencils', 'Timer'],
 'Give each student a fear worksheet and colored pencils',
 '1. Students draw their biggest fear related to learning\n2. Write 3 things that could go wrong\n3. Write 3 things that could go right\n4. Share with a partner if comfortable',
 ARRAY['Student can articulate their fear', 'Student identifies positive outcomes', 'Student shows willingness to share'],
 ARRAY['Students too scared to draw', 'Students dont want to share', 'Activity takes too long'],
 'For younger students, use simpler language and provide examples. For advanced students, add reflection questions.');

-- Insert sample assessment rubrics
INSERT INTO assessment_rubrics (lesson_id, pillar_name, criteria_name, level_1_description, level_2_description, level_3_description, level_4_description, weight_percentage) VALUES
((SELECT id FROM curriculum_lessons WHERE title = 'Understanding Fear and Failure'),
 'confidence',
 'Willingness to Try New Challenges',
 'Avoids new challenges and gives up quickly when faced with difficulty',
 'Attempts new challenges but needs significant encouragement and support',
 'Approaches new challenges with some confidence and persists through initial difficulties',
 'Embraces new challenges enthusiastically and demonstrates resilience when facing setbacks',
 40);

-- Insert sample parent communication templates
INSERT INTO parent_communication_templates (template_name, template_type, subject_line, template_content, pillar_focus, merge_fields) VALUES
('Weekly Confidence Progress', 
 'weekly_progress',
 '{student_name}''s Confidence Journey This Week',
 'Dear {parent_name},\n\nThis week, {student_name} has been working on building confidence through our structured curriculum. Here are the highlights:\n\n• Progress: {progress_percentage}% through the current module\n• Key Achievement: {key_achievement}\n• Areas of Growth: {growth_areas}\n• Next Week Focus: {next_focus}\n\nYour child is developing wonderful self-assurance skills. Keep encouraging them at home!\n\nBest regards,\nCoach {coach_name}',
 'confidence',
 ARRAY['student_name', 'parent_name', 'progress_percentage', 'key_achievement', 'growth_areas', 'next_focus', 'coach_name']);

-- Enable RLS for new tables
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_communication_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable all operations for curriculum_modules" ON curriculum_modules FOR ALL USING (true);
CREATE POLICY "Enable all operations for curriculum_lessons" ON curriculum_lessons FOR ALL USING (true);
CREATE POLICY "Enable all operations for coaching_stories" ON coaching_stories FOR ALL USING (true);
CREATE POLICY "Enable all operations for class_curriculum_progress" ON class_curriculum_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_lesson_progress" ON student_lesson_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for coaching_activities" ON coaching_activities FOR ALL USING (true);
CREATE POLICY "Enable all operations for assessment_rubrics" ON assessment_rubrics FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_assessments" ON student_assessments FOR ALL USING (true);
CREATE POLICY "Enable all operations for parent_communication_templates" ON parent_communication_templates FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_curriculum_lessons_module_id ON curriculum_lessons(module_id);
CREATE INDEX idx_curriculum_lessons_lesson_order ON curriculum_lessons(lesson_order);
CREATE INDEX idx_coaching_stories_pillar_focus ON coaching_stories(pillar_focus);
CREATE INDEX idx_coaching_stories_age_group ON coaching_stories(age_group);
CREATE INDEX idx_class_curriculum_progress_class_id ON class_curriculum_progress(class_id);
CREATE INDEX idx_class_curriculum_progress_lesson_id ON class_curriculum_progress(lesson_id);
CREATE INDEX idx_student_lesson_progress_student_id ON student_lesson_progress(student_id);
CREATE INDEX idx_student_lesson_progress_lesson_id ON student_lesson_progress(lesson_id);
CREATE INDEX idx_coaching_activities_lesson_id ON coaching_activities(lesson_id);
CREATE INDEX idx_assessment_rubrics_lesson_id ON assessment_rubrics(lesson_id);
CREATE INDEX idx_student_assessments_student_id ON student_assessments(student_id);
CREATE INDEX idx_student_assessments_lesson_id ON student_assessments(lesson_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_curriculum_modules_updated_at BEFORE UPDATE ON curriculum_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_curriculum_lessons_updated_at BEFORE UPDATE ON curriculum_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coaching_stories_updated_at BEFORE UPDATE ON coaching_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_curriculum_progress_updated_at BEFORE UPDATE ON class_curriculum_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_lesson_progress_updated_at BEFORE UPDATE ON student_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();