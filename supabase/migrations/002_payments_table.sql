-- Payments table for checkout workflow
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  next_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  services TEXT[] DEFAULT '{}',
  receipt_number TEXT UNIQUE NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_date DATE,
  reminder_sent BOOLEAN DEFAULT false,
  receipt_emailed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reminder_date to appointments table for SMS scheduling
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_date DATE,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_date ON appointments(reminder_date);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);
