-- GroomGroove Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  sms_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dogs table
CREATE TABLE IF NOT EXISTS dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  weight DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  services TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'cancelled', 'completed')),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_dogs_customer_id ON dogs(customer_id);

-- Row Level Security (RLS) Policies
-- For now, allow all operations (you should tighten this for production)

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for dogs
CREATE POLICY "Allow all operations on dogs" ON dogs
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for appointments
CREATE POLICY "Allow all operations on appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO customers (id, name, email, phone, sms_consent) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'sarah@example.com', '+15551234001', true),
  ('22222222-2222-2222-2222-222222222222', 'Mike Chen', 'mike@example.com', '+15551234002', true),
  ('33333333-3333-3333-3333-333333333333', 'Emma Wilson', 'emma@example.com', '+15551234003', true),
  ('44444444-4444-4444-4444-444444444444', 'James Brown', 'james@example.com', '+15551234004', false),
  ('55555555-5555-5555-5555-555555555555', 'Lisa Park', 'lisa@example.com', '+15551234005', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO dogs (id, customer_id, name, breed, weight) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Bella', 'Golden Retriever', 65),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Max', 'German Shepherd', 75),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Daisy', 'Poodle', 45),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Rocky', 'Bulldog', 50),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'Luna', 'Husky', 55)
ON CONFLICT (id) DO NOTHING;
