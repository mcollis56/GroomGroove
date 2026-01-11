-- SMS Notifications table for tracking sent reminders
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sms_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'confirmation_request', 'confirmed', 'cancelled')),
  delivered BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sms_notifications_appointment_id ON sms_notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_type ON sms_notifications(type);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_created_at ON sms_notifications(created_at);

-- RLS for sms_notifications
ALTER TABLE sms_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on sms_notifications" ON sms_notifications
  FOR ALL USING (true) WITH CHECK (true);
