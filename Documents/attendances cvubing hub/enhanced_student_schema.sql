-- Enhanced student schema for offline functionality and quick registration
-- This adds new fields to the existing students table

-- Add new columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS surname TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS parent_contact_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS parent_email TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS medical_notes TEXT,
ADD COLUMN IF NOT EXISTS registration_source TEXT DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS is_synced BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offline_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create offline sync queue table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id TEXT, -- Could be UUID or offline_id
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'failed'
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    error_message TEXT
);

-- Create webhook configurations table for n8n integration
CREATE TABLE IF NOT EXISTS webhook_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_key TEXT,
    events TEXT[] NOT NULL, -- ['student_created', 'attendance_recorded', 'merit_awarded']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook events log
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_config_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    response_code INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sent_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_surname ON students(surname);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_school_name ON students(school_name);
CREATE INDEX IF NOT EXISTS idx_students_offline_id ON students(offline_id);
CREATE INDEX IF NOT EXISTS idx_students_is_synced ON students(is_synced);
CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_status ON offline_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_table ON offline_sync_queue(table_name);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample webhook configuration for n8n
INSERT INTO webhook_configs (name, url, events, is_active) 
VALUES (
    'n8n Student Events',
    'https://your-n8n-instance.com/webhook/student-events',
    ARRAY['student_created', 'attendance_recorded', 'merit_awarded'],
    false
) ON CONFLICT DO NOTHING;