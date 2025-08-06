-- Coaching Program Guide Database Schema
-- This schema supports the 8-week coaching program with lesson tracking

-- Create enum for lesson status
CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create enum for student term status
CREATE TYPE student_term_status AS ENUM ('active', 'inactive', 'graduated', 'transferred');

-- Terms table to manage different school terms
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update students table to include term management
ALTER TABLE students ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES terms(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS term_status student_term_status DEFAULT 'active';
ALTER TABLE students ADD COLUMN IF NOT EXISTS enrolled_date DATE DEFAULT CURRENT_DATE;

-- Coaching program curriculum - the 8-week structure
CREATE TABLE coaching_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
    title TEXT NOT NULL,
    theme TEXT NOT NULL,
    opening_message TEXT NOT NULL,
    character_story_title TEXT NOT NULL,
    character_story_content TEXT NOT NULL,
    cube_connection TEXT NOT NULL,
    character_activity TEXT NOT NULL,
    coach_conversation_starters TEXT[] NOT NULL,
    weekly_affirmation TEXT NOT NULL,
    take_home_challenge TEXT NOT NULL,
    parent_communication TEXT NOT NULL,
    technical_goals TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(week_number)
);

-- Class lesson progress - tracks which lessons have been completed for each class
CREATE TABLE class_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
    status lesson_status DEFAULT 'not_started',
    completed_by UUID REFERENCES coaches(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(class_id, week_number)
);

-- Student lesson progress - tracks individual student progress through the program
CREATE TABLE student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
    status lesson_status DEFAULT 'not_started',
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, week_number)
);

-- Sales pipeline stages - customizable sales flow
CREATE TABLE sales_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    order_position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student sales progress - tracks students through the sales pipeline
CREATE TABLE student_sales_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES sales_stages(id),
    moved_to_stage_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    amount_zar DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parent notifications log
CREATE TABLE parent_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    parent_email TEXT,
    parent_phone TEXT,
    delivery_status TEXT DEFAULT 'pending'
);

-- Indexes for performance
CREATE INDEX idx_terms_active ON terms(is_active);
CREATE INDEX idx_students_term ON students(term_id);
CREATE INDEX idx_students_term_status ON students(term_status);
CREATE INDEX idx_class_lesson_progress_class ON class_lesson_progress(class_id);
CREATE INDEX idx_student_lesson_progress_student ON student_lesson_progress(student_id);
CREATE INDEX idx_student_sales_progress_student ON student_sales_progress(student_id);
CREATE INDEX idx_parent_notifications_student ON parent_notifications(student_id);

-- Function to update student progress when class lesson is completed
CREATE OR REPLACE FUNCTION update_student_progress_on_class_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- When a class lesson is marked as completed, update all active students in that class
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO student_lesson_progress (student_id, week_number, status, completed_at)
        SELECT 
            s.id,
            NEW.week_number,
            'completed',
            NEW.completed_at
        FROM students s
        WHERE s.class_id = NEW.class_id 
        AND s.term_status = 'active'
        ON CONFLICT (student_id, week_number) 
        DO UPDATE SET 
            status = 'completed',
            completed_at = NEW.completed_at,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update student progress
CREATE TRIGGER class_lesson_completion_trigger
    AFTER INSERT OR UPDATE ON class_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_student_progress_on_class_completion();

-- Insert the 8-week coaching program
INSERT INTO coaching_weeks (week_number, title, theme, opening_message, character_story_title, character_story_content, cube_connection, character_activity, coach_conversation_starters, weekly_affirmation, take_home_challenge, parent_communication, technical_goals) VALUES
(1, 'FOUNDATION MINDSET', 'Growth Mindset', 'Today we start an incredible journey. Look at this cube - it might seem impossible now, but by the end of our time together, this will be easy for you. The secret isn''t being ''smart'' - it''s being willing to try, fail, and try again.', 'The Story of Michael Jordan''s Cut', 'Did you know Michael Jordan was cut from his high school basketball team? The coach thought he wasn''t good enough. But instead of giving up, Michael used that as fuel. He practiced harder than anyone else. He failed thousands of shots to make thousands more. Today, he''s considered the greatest basketball player ever - not because he never failed, but because he never let failure stop him.', 'This cube is going to challenge you just like basketball challenged Michael Jordan. You might mix it up instead of solving it. You might forget algorithms. That''s not failure - that''s learning! Every mistake teaches your brain something new.', 'Growth Mindset Declarations - Have each student complete: "I can''t solve this cube... YET. But I will because..."', ARRAY['What''s the hardest thing you''ve ever learned? How did you stick with it?', 'When you make a mistake with the cube, what do you think?', 'How do you feel when something seems too hard?'], 'I am learning and growing with every attempt.', 'Practice white cross for 10 minutes daily. Focus on improvement, not perfection.', 'This week [Student] learned that struggle is part of learning. They''re developing a growth mindset that will help them in school and life.', ARRAY['Introduction to cube structure and basic moves', 'White cross formation (Track 1-2) or basic manipulation (Track 3-4)', 'Finger positioning and basic rotations']),

(2, 'ATTENTION TO DETAIL', 'Precision and Focus', 'This week we''re learning that the smallest details matter most. One wrong move can mess up your entire solve - but one right move can fix everything. This teaches us to pay attention and be precise in everything we do.', 'The NASA Pencil', 'NASA spent millions trying to create a pen that would write in space. Meanwhile, the Russians used a pencil. Sometimes the simple, precise solution is the best one. But whether it''s a pen or pencil, if you don''t use it carefully and precisely, your message won''t be clear.', 'Every algorithm has exact moves in exact order. Miss one move, and nothing works. But when you do each move precisely, magic happens. This is teaching your brain to focus on details - a skill that will help you in math, reading, and everything else.', 'Precision Practice - Students practice one algorithm 10 times, focusing on exact finger positions and smooth movements.', ARRAY['What happens when you do the algorithm sloppy vs. precise?', 'Where else in your life do small details matter?', 'How do you stay focused when something requires many steps?'], 'I pay attention to details because they matter.', 'Practice one algorithm perfectly 5 times each day. Quality over quantity.', 'This week [Student] developed attention to detail and precision. These skills are directly transferring to better focus in homework and activities.', ARRAY['Complete white cross consistently', 'Begin first layer corners (Track 1-2) or improve cross (Track 3-4)', 'Algorithm memorization techniques']),

(3, 'PERSEVERANCE POWER', 'Persistence Through Difficulty', 'This week will be tough. You''re going to feel frustrated. Your brain might want to quit. But this is where champions are made - not when it''s easy, but when it''s hard and you keep going anyway.', 'Thomas Edison''s 10,000 Attempts', 'When Thomas Edison was inventing the light bulb, a reporter asked him, ''How does it feel to fail 1,000 times?'' Edison replied, ''I didn''t fail 1,000 times. I found 1,000 ways that don''t work, bringing me closer to the way that does work.'' He tried over 10,000 different materials before finding the right one.', 'You might scramble your cube accidentally while trying to solve it. You might forget algorithms. That''s not failure - that''s finding ways that don''t work, which brings you closer to ways that do work. Every ''mistake'' is actually data for your brain.', 'Perseverance Tracking - Students track their attempts (not successes) for each challenge. Celebrate high attempt numbers.', ARRAY['What do you do when you feel like giving up?', 'Tell me about a time you kept trying when something was hard.', 'How does it feel different when you finally get something you''ve been struggling with?'], 'I keep trying because that''s how I grow stronger.', 'When you get frustrated, take 3 deep breaths and try 3 more times before taking a break.', 'This week [Student] developed perseverance and resilience. They''re learning that struggle is temporary but giving up is permanent.', ARRAY['Master first layer completely (Track 1-2) or consistent cross (Track 3-4)', 'Introduction to F2L concepts or second layer preparation', 'Speed improvement and muscle memory']),

(4, 'GOAL ACHIEVEMENT', 'Strategic Planning and Goal Setting', 'Today we learn the difference between wishing and achieving. Wishing is ''I hope I can solve this cube.'' Achieving is ''I will solve this cube by practicing these specific steps every day.'' Champions don''t just dream - they plan.', 'Jim Carrey''s $10 Million Check', 'When Jim Carrey was a struggling actor, he wrote himself a check for $10 million for ''acting services rendered'' and dated it for Thanksgiving 1995. He carried it in his wallet for years. Just before Thanksgiving 1995, he learned he would make $10 million for the movie ''Dumb and Dumber.'' He didn''t just dream it - he visualized it, planned for it, and worked toward it every day.', 'Your cube solving has gotten better because you''ve been practicing specific moves with specific goals. Now we''re going to set bigger goals and make specific plans to reach them. This teaches your brain how to turn any dream into reality.', 'Goal Setting Workshop - Students set SMART goals: "By [date], I will solve the first layer in under [time] by practicing [specific action] [frequency]."', ARRAY['What''s something you really want to achieve this year?', 'What''s the difference between hoping for something and planning for something?', 'How does it feel when you reach a goal you set?'], 'I set goals and make plans to achieve them.', 'Write down 3 goals (1 cubing, 1 school, 1 personal) and one action step for each.', 'This week [Student] learned goal setting and strategic planning. They''re developing the mindset that turns dreams into achievable targets.', ARRAY['Consistent first layer solving (Track 1-2) or improved speed (Track 3-4)', 'Goal setting for solve times and accuracy', 'Introduction to personal best tracking']),

(5, 'PROBLEM-SOLVING MASTERY', 'Systematic Problem-Solving', 'This week you become detectives. When your cube doesn''t do what you expect, you won''t panic - you''ll investigate. You''ll ask questions, try different approaches, and solve the mystery. This is how inventors, scientists, and leaders think.', 'The Apollo 13 Solution', 'When Apollo 13''s oxygen tank exploded in space, the astronauts had a huge problem - how to remove carbon dioxide from their air using only materials on the spacecraft. Engineers on Earth had to figure out how to fit a square filter into a round hole using only tape, plastic bags, and cardboard. They didn''t panic - they broke the problem into pieces and solved it step by step. Their systematic thinking saved three lives.', 'Sometimes your cube gets scrambled in a weird way that doesn''t match what you''ve learned. Instead of getting frustrated, you become a detective. You look at what''s wrong, think about what you know, and try different approaches. This teaches your brain to stay calm and think clearly when facing any problem.', 'Problem-Solving Process - Teach the PEACE method: Pause and breathe, Examine what''s wrong, Ask what you know that might help, Choose an approach to try, Evaluate if it worked (if not, repeat)', ARRAY['When you''re stuck, what''s the first thing you should do?', 'How does staying calm help you think better?', 'Tell me about a problem you solved recently. How did you do it?'], 'I can solve any problem by staying calm and thinking step by step.', 'When facing any problem this week (homework, chores, etc.), use the PEACE method.', 'This week [Student] developed systematic problem-solving skills. They''re learning to approach challenges calmly and methodically.', ARRAY['Begin second layer techniques (Track 1-2) or first layer mastery (Track 3-4)', 'Introduction to algorithm modification and adaptation', 'Problem-solving when algorithms don''t work as expected']),

(6, 'LEADERSHIP EMERGENCE', 'Servant Leadership', 'This week you''re not just learners - you''re teachers. Real leaders don''t just get good at something for themselves. They help others get good too. When you teach someone else, you become twice as good at it yourself.', 'John Wooden''s Pyramid of Success', 'Coach John Wooden won 10 NCAA basketball championships, but he''s most famous for teaching his players that success means helping your teammates succeed. He said, ''A player who makes a team great is more valuable than a great player.'' His players didn''t just become great basketball players - they became great leaders in life.', 'Now that you know more about cubing, you can help others who are just starting. When you teach someone else, three amazing things happen: they learn faster, you understand it better, and you both feel great about helping each other. This is what real leadership looks like.', 'Teaching Partnership - Pair advanced students with beginners for structured teaching time. Focus on patience and clear communication.', ARRAY['How does it feel when someone helps you learn something new?', 'What''s the best way to teach someone who''s struggling?', 'How does teaching someone else help you learn better?'], 'I grow stronger when I help others grow stronger.', 'Teach someone at home (sibling, parent, friend) something you learned at TCH this week.', 'This week [Student] developed leadership and teaching skills. They''re learning that true strength comes from helping others succeed.', ARRAY['Help newer students or struggling classmates', 'Demonstrate algorithms and techniques to others', 'Develop teaching and communication skills']),

(7, 'COMMUNITY BUILDING', 'Community and Collaboration', 'This week we learn that the best things in life happen when people work together. Your cube skills are amazing, but when you combine them with your classmates'' skills, you can do things that seem impossible. This is the power of community.', 'The Amish Barn Raising', 'In Amish communities, when a family needs a new barn, the whole community comes together for a ''barn raising.'' What would take one family months to build, the community builds in one day. Everyone brings different skills - some are good at carpentry, others at planning, others at organizing. Together, they create something beautiful that benefits everyone.', 'Our TCH community is like an Amish barn raising. Some of you are fast solvers, others are great teachers, others are encouraging supporters. When we combine all our strengths, we help everyone become better than they could be alone. This teaches you how to be part of something bigger than yourself.', 'Community Cube Challenge - Team activities where success depends on everyone contributing their strengths and supporting each other''s weaknesses.', ARRAY['What makes a team stronger than individual players?', 'How do you help someone who''s having a bad day?', 'What''s your special strength that helps our TCH community?'], 'I am part of a community, and my community is part of me.', 'Do something this week to help your family, class, or friend group work better together.', 'This week [Student] developed community awareness and collaboration skills. They''re learning how to be part of something bigger than themselves.', ARRAY['Team challenges and group problem-solving', 'Collaborative cube projects and activities', 'Celebrating others'' successes and supporting struggles']),

(8, 'CELEBRATION AND VISION', 'Reflection, Celebration, and Future Vision', 'Today we celebrate an incredible journey. Look how far you''ve come! But this isn''t the end - it''s just the beginning. You''ve learned that you can do hard things, help others, and keep growing. Now you get to choose what amazing thing you''ll conquer next.', 'Neil Armstrong''s Next Step', 'When Neil Armstrong stepped on the moon, he said, ''That''s one small step for man, one giant leap for mankind.'' But you know what he did next? He took another step. And another. Because achieving one dream just shows you that you can achieve the next one. The moon landing wasn''t the end of exploration - it was the beginning.', 'Learning to solve this cube wasn''t just about the cube - it was about learning that you can do anything you set your mind to. You''ve proven to yourself that you can persist through difficulty, help others, solve problems, and achieve goals. Now you can use these superpowers for anything you want to accomplish.', 'Celebration and Vision Board - Students create a visual representation of what they''ve learned and what they want to achieve next.', ARRAY['What are you most proud of from these 8 weeks?', 'What did you learn about yourself that surprised you?', 'What do you want to tackle next with your new superpowers?'], 'I have grown stronger, and I will keep growing stronger.', 'Share with your family three things you learned about yourself and one new goal you want to achieve.', 'This week [Student] reflected on their growth and set new goals. They''ve developed confidence, persistence, and leadership that will serve them throughout life.', ARRAY['Demonstrate mastery of learned skills', 'Set goals for continued improvement', 'Celebrate progress and achievements']);

-- Insert default sales stages (South African context)
INSERT INTO sales_stages (name, description, order_position) VALUES
('Lead', 'Initial contact or interest shown', 1),
('Qualified', 'Confirmed interest and basic qualification', 2),
('Demo Booked', 'Demonstration or trial class scheduled', 3),
('Trial Completed', 'Completed trial class or demonstration', 4),
('Proposal Sent', 'Pricing and program proposal provided', 5),
('Negotiation', 'Discussing terms and pricing', 6),
('Enrolled', 'Student enrolled and payment received', 7),
('Active Student', 'Currently attending classes', 8);

-- Insert a current term
INSERT INTO terms (name, start_date, end_date, is_active) VALUES
('Term 1 2024', '2024-01-15', '2024-03-22', true);

-- Update existing students with the current term
UPDATE students SET term_id = (SELECT id FROM terms WHERE is_active = true LIMIT 1);

-- Enable RLS for new tables
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sales_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Enable all operations for terms" ON terms FOR ALL USING (true);
CREATE POLICY "Enable all operations for coaching_weeks" ON coaching_weeks FOR ALL USING (true);
CREATE POLICY "Enable all operations for class_lesson_progress" ON class_lesson_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_lesson_progress" ON student_lesson_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for sales_stages" ON sales_stages FOR ALL USING (true);
CREATE POLICY "Enable all operations for student_sales_progress" ON student_sales_progress FOR ALL USING (true);
CREATE POLICY "Enable all operations for parent_notifications" ON parent_notifications FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;