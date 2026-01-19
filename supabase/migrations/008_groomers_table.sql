-- Create groomers table for team members
CREATE TABLE IF NOT EXISTS groomers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'Groomer',
  color TEXT DEFAULT '#3B82F6', -- Blue default for calendar
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE groomers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all groomers in their organization
-- For now, all authenticated users can see all groomers
CREATE POLICY "Authenticated users can view groomers"
  ON groomers FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins/owners can insert/update/delete groomers
-- For simplicity, allow all authenticated users for now
CREATE POLICY "Authenticated users can manage groomers"
  ON groomers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_groomers_user_id ON groomers(user_id);
CREATE INDEX idx_groomers_is_active ON groomers(is_active);

-- Insert a default groomer (the owner)
-- This will be linked to the first user who signs up
INSERT INTO groomers (name, role, color)
VALUES ('Mark', 'Owner', '#8B5CF6')
ON CONFLICT DO NOTHING;
