-- =============================================
-- SCHOOLS TABLE
-- Normalizes school data for team-based competitions
-- =============================================

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT,
  division TEXT CHECK(division IN ('A', 'B', 'C')) DEFAULT 'C',
  logo_url TEXT,
  color_hex TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(active);
CREATE INDEX IF NOT EXISTS idx_schools_division ON schools(division);

-- Enable RLS if using Supabase
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active schools
CREATE POLICY "Public can view active schools" ON schools
  FOR SELECT USING (active = true);

-- Allow authenticated users to manage schools
CREATE POLICY "Authenticated users can manage schools" ON schools
  FOR ALL USING (auth.role() = 'authenticated');
