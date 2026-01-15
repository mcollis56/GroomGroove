-- Add 'in_progress' status to appointments table
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending_confirmation', 'confirmed', 'cancelled', 'completed', 'in_progress'));

-- Update any existing appointments that might need the new status
-- (Optional: if you have logic that requires this)
