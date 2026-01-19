-- Add on_duty column to groomers table for attendance tracking
ALTER TABLE groomers ADD COLUMN IF NOT EXISTS on_duty BOOLEAN DEFAULT false;

-- Create index for faster on_duty queries
CREATE INDEX IF NOT EXISTS idx_groomers_on_duty ON groomers(on_duty);
