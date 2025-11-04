-- Authentication and Collaboration System Database Schema
-- Add these tables to support authentication, role-based access, comments, and tags

-- Update users table to work with Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'team_member';

-- Create auth triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, status, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team_member'),
    'active',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update last_active timestamp on login
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET last_active = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active();

-- Tags system
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Hex color code
  description TEXT,
  category VARCHAR(50),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Entity tags (many-to-many relationship between entities and tags)
CREATE TABLE IF NOT EXISTS entity_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  entity_id VARCHAR(255) NOT NULL, -- Can reference any entity (project, task, student, etc.)
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('project', 'task', 'goal', 'school', 'student', 'reminder')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tag_id, entity_id, entity_type)
);

-- Comments system
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  entity_id VARCHAR(255) NOT NULL, -- Can reference any entity
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('project', 'task', 'goal', 'school', 'student', 'reminder')),
  user_id UUID NOT NULL REFERENCES users(id),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE
);

-- Comment reactions
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'love', 'helpful', 'agree')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, type)
);

-- Mentions system
CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(comment_id, mentioned_user_id)
);

-- Activity feed for tracking user actions
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'created_project', 'commented', 'tagged', etc.
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  metadata JSONB, -- Additional data about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'mention', 'comment', 'assignment', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  action_url TEXT, -- URL to navigate to when clicked
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update projects table to support collaboration
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_commented_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Update work_tasks table to support collaboration
ALTER TABLE work_tasks ADD COLUMN IF NOT EXISTS last_commented_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE work_tasks ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Update reminders table to support collaboration
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS last_commented_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON mentions(mentioned_user_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- Functions to update comment counts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update comment count when comment is added
  IF TG_OP = 'INSERT' THEN
    EXECUTE format('UPDATE %I SET comment_count = comment_count + 1, last_commented_at = NOW() WHERE id = $1', 
                   CASE NEW.entity_type 
                     WHEN 'project' THEN 'projects'
                     WHEN 'task' THEN 'work_tasks'
                     WHEN 'reminder' THEN 'reminders'
                   END)
    USING NEW.entity_id;
    RETURN NEW;
  END IF;
  
  -- Update comment count when comment is deleted
  IF TG_OP = 'DELETE' THEN
    EXECUTE format('UPDATE %I SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1', 
                   CASE OLD.entity_type 
                     WHEN 'project' THEN 'projects'
                     WHEN 'task' THEN 'work_tasks'
                     WHEN 'reminder' THEN 'reminders'
                   END)
    USING OLD.entity_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comment counts
DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert activity when comment is created
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'comments' THEN
    INSERT INTO activity_feed (user_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.user_id, 'commented', NEW.entity_type, NEW.entity_id, 
            jsonb_build_object('comment_id', NEW.id));
    RETURN NEW;
  END IF;
  
  -- Insert activity when tag is added
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'entity_tags' THEN
    INSERT INTO activity_feed (user_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.created_by, 'tagged', NEW.entity_type, NEW.entity_id,
            jsonb_build_object('tag_id', NEW.tag_id));
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity feed
DROP TRIGGER IF EXISTS activity_comment_trigger ON comments;
CREATE TRIGGER activity_comment_trigger
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_activity_entry();

DROP TRIGGER IF EXISTS activity_tag_trigger ON entity_tags;
CREATE TRIGGER activity_tag_trigger
  AFTER INSERT ON entity_tags
  FOR EACH ROW EXECUTE FUNCTION create_activity_entry();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Tags can be viewed by all, created by all, but only modified by creator or admin
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own tags" ON tags FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own tags" ON tags FOR DELETE USING (created_by = auth.uid());

-- Entity tags policies
CREATE POLICY "Anyone can view entity tags" ON entity_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create entity tags" ON entity_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete entity tags they created" ON entity_tags FOR DELETE USING (created_by = auth.uid());

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (user_id = auth.uid());

-- Comment reactions policies
CREATE POLICY "Anyone can view reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON comment_reactions FOR ALL USING (user_id = auth.uid());

-- Mentions policies
CREATE POLICY "Users can view mentions directed to them" ON mentions FOR SELECT USING (mentioned_user_id = auth.uid());
CREATE POLICY "Authenticated users can create mentions" ON mentions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update mentions directed to them" ON mentions FOR UPDATE USING (mentioned_user_id = auth.uid());

-- Activity feed policies
CREATE POLICY "Users can view activity feed" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "System can insert activity" ON activity_feed FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Insert default tags
INSERT INTO tags (name, color, category, created_by, description) VALUES
('High Priority', '#EF4444', 'Priority', '550e8400-e29b-41d4-a716-446655440101', 'High priority items requiring immediate attention'),
('Medium Priority', '#F59E0B', 'Priority', '550e8400-e29b-41d4-a716-446655440101', 'Medium priority items'),
('Low Priority', '#10B981', 'Priority', '550e8400-e29b-41d4-a716-446655440101', 'Low priority items'),
('In Progress', '#3B82F6', 'Status', '550e8400-e29b-41d4-a716-446655440101', 'Currently being worked on'),
('Completed', '#10B981', 'Status', '550e8400-e29b-41d4-a716-446655440101', 'Finished items'),
('Blocked', '#EF4444', 'Status', '550e8400-e29b-41d4-a716-446655440101', 'Items that are blocked'),
('Bug', '#EF4444', 'Type', '550e8400-e29b-41d4-a716-446655440101', 'Bug reports and fixes'),
('Feature', '#8B5CF6', 'Type', '550e8400-e29b-41d4-a716-446655440101', 'New features'),
('Enhancement', '#6366F1', 'Type', '550e8400-e29b-41d4-a716-446655440101', 'Improvements to existing features'),
('Documentation', '#6B7280', 'Type', '550e8400-e29b-41d4-a716-446655440101', 'Documentation related items')
ON CONFLICT (name) DO NOTHING;