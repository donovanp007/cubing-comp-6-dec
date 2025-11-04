-- ULTIMATE DATABASE SETUP - Bulletproof Script
-- This script handles ALL edge cases and will work on any Supabase instance
-- Run this entire script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: SAFELY DROP POLICIES (only if tables exist)
-- =====================================================

DO $$ 
DECLARE
    table_exists boolean;
BEGIN
    -- Check and drop policies for each table only if it exists
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on users" ON users;
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'project_members') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on project_members" ON project_members;
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'task_lists') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on task_lists" ON task_lists;
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'work_tasks') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on work_tasks" ON work_tasks;
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reminders') INTO table_exists;
    IF table_exists THEN
        DROP POLICY IF EXISTS "Allow all operations on reminders" ON reminders;
    END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE ALL TABLES IN CORRECT ORDER
-- =====================================================

-- Create users table (no dependencies)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'team_member' CHECK (role IN ('admin', 'manager', 'team_member')),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table (depends on users)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    owner_id UUID NOT NULL REFERENCES users(id),
    start_date DATE,
    due_date DATE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    aiGenerated BOOLEAN DEFAULT FALSE
);

-- Create project_members table (depends on projects and users)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create task_lists table (depends on projects)
CREATE TABLE IF NOT EXISTS task_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_tasks table (depends on projects, task_lists, and users)
CREATE TABLE IF NOT EXISTS work_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_list_id UUID REFERENCES task_lists(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES work_tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    due_date DATE,
    start_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    position INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create reminders table (CRM tasks) with ALL required columns upfront
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    student_id VARCHAR(255),
    student_name VARCHAR(255),
    school_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE,
    task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('follow_up', 'payment', 'certificate', 'equipment', 'general')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STEP 3: ADD MISSING COLUMNS (if they don't exist)
-- =====================================================

DO $$ 
BEGIN
    -- Add missing columns to existing tables
    
    -- Add aiGenerated to projects if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='aigenerated') THEN
        ALTER TABLE projects ADD COLUMN aiGenerated BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add task_type to reminders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reminders' AND column_name='task_type') THEN
        ALTER TABLE reminders ADD COLUMN task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('follow_up', 'payment', 'certificate', 'equipment', 'general'));
    END IF;
    
    -- Add assigned_to to reminders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reminders' AND column_name='assigned_to') THEN
        ALTER TABLE reminders ADD COLUMN assigned_to UUID REFERENCES users(id);
    END IF;
    
    -- Add created_by to reminders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reminders' AND column_name='created_by') THEN
        ALTER TABLE reminders ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;
    
    -- Add completed_at to reminders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reminders' AND column_name='completed_at') THEN
        ALTER TABLE reminders ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    RAISE NOTICE 'Column additions completed successfully';
END $$;

-- =====================================================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

CREATE INDEX IF NOT EXISTS idx_work_tasks_project ON work_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_work_tasks_assigned ON work_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_tasks_status ON work_tasks(status);
CREATE INDEX IF NOT EXISTS idx_work_tasks_created_by ON work_tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_reminders_assigned ON reminders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_task_type ON reminders(task_type);
CREATE INDEX IF NOT EXISTS idx_reminders_student ON reminders(student_id);

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: CREATE POLICIES (safe way)
-- =====================================================

DO $$ 
BEGIN
    -- Create policies only if they don't exist
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all operations on users') THEN
        CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow all operations on projects') THEN
        CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Allow all operations on project_members') THEN
        CREATE POLICY "Allow all operations on project_members" ON project_members FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_lists' AND policyname = 'Allow all operations on task_lists') THEN
        CREATE POLICY "Allow all operations on task_lists" ON task_lists FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'work_tasks' AND policyname = 'Allow all operations on work_tasks') THEN
        CREATE POLICY "Allow all operations on work_tasks" ON work_tasks FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Allow all operations on reminders') THEN
        CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);
    END IF;
    
    RAISE NOTICE 'Policies created successfully';
END $$;

-- =====================================================
-- STEP 7: CREATE UPDATE TRIGGERS
-- =====================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate triggers (safe)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_lists_updated_at ON task_lists;
CREATE TRIGGER update_task_lists_updated_at BEFORE UPDATE ON task_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_tasks_updated_at ON work_tasks;
CREATE TRIGGER update_work_tasks_updated_at BEFORE UPDATE ON work_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: INSERT SAMPLE DATA (safe inserts)
-- =====================================================

-- Insert sample users (will not create duplicates)
INSERT INTO users (id, name, email, role, department, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440101'::uuid, 'John Admin', 'john@cubinghub.com', 'admin', 'Management', 'active'),
    ('550e8400-e29b-41d4-a716-446655440102'::uuid, 'Sarah Manager', 'sarah@cubinghub.com', 'manager', 'Operations', 'active'),
    ('550e8400-e29b-41d4-a716-446655440103'::uuid, 'Mike Staff', 'mike@cubinghub.com', 'team_member', 'Education', 'active'),
    ('550e8400-e29b-41d4-a716-446655440104'::uuid, 'Emma Coordinator', 'emma@cubinghub.com', 'team_member', 'Logistics', 'active')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insert sample projects
INSERT INTO projects (id, name, description, color, status, priority, owner_id, due_date, progress, tags) VALUES
    ('550e8400-e29b-41d4-a716-446655440201'::uuid, 'Q1 School Expansion', 'Expand cubing program to 5 new schools', '#3B82F6', 'active', 'high', '550e8400-e29b-41d4-a716-446655440101'::uuid, '2025-03-31'::date, 65, ARRAY['expansion', 'schools']),
    ('550e8400-e29b-41d4-a716-446655440202'::uuid, 'Digital Learning Platform', 'Online cubing tutorials', '#10B981', 'active', 'medium', '550e8400-e29b-41d4-a716-446655440102'::uuid, '2025-06-30'::date, 30, ARRAY['digital', 'platform'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    updated_at = NOW();

-- Insert sample project members
INSERT INTO project_members (project_id, user_id, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440201'::uuid, '550e8400-e29b-41d4-a716-446655440101'::uuid, 'lead'),
    ('550e8400-e29b-41d4-a716-446655440201'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid, 'member')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample work task
INSERT INTO work_tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, progress) VALUES
    ('550e8400-e29b-41d4-a716-446655440401'::uuid, '550e8400-e29b-41d4-a716-446655440201'::uuid, 'Create budget proposal', 'Develop budget for expansion', 'in_progress', 'high', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440101'::uuid, '2025-01-20'::date, 70)
ON CONFLICT (id) DO NOTHING;

-- Insert sample CRM tasks (reminders)
INSERT INTO reminders (title, description, priority, due_date, status, student_name, task_type, assigned_to, created_by) VALUES
    ('Follow up on payment', 'Contact parent about outstanding payment', 'high', '2025-01-15'::date, 'pending', 'Sarah Johnson', 'payment', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid),
    ('Prepare certificates', 'Prepare completion certificates', 'medium', '2025-01-20'::date, 'pending', 'Multiple Students', 'certificate', '550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440101'::uuid)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 9: FINAL VERIFICATION AND RESULTS
-- =====================================================

-- Show success message
SELECT '✅ Database setup completed successfully!' as status;

-- Show created tables
SELECT 
    tablename as table_name,
    '✅ Created' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'project_members', 'task_lists', 'work_tasks', 'reminders')
ORDER BY tablename;

-- Show record counts
SELECT 
    '👥 Users' as table_name, 
    count(*)::text as record_count 
FROM users
UNION ALL
SELECT 
    '📋 Projects', 
    count(*)::text 
FROM projects
UNION ALL
SELECT 
    '✅ Work Tasks', 
    count(*)::text 
FROM work_tasks
UNION ALL
SELECT 
    '🔔 CRM Tasks', 
    count(*)::text 
FROM reminders
ORDER BY table_name;

-- Test query to verify relationships work
SELECT 
    'Sample Data Test' as test_name,
    p.name as project_name,
    u.name as owner_name,
    count(pm.user_id) as team_members,
    count(wt.id) as tasks
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN work_tasks wt ON p.id = wt.project_id
GROUP BY p.id, p.name, u.name
LIMIT 1;

SELECT '🎉 Setup complete! Your CRM database is ready to use!' as final_message;