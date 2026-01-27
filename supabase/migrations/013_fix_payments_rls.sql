-- Fix RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Remove any conflicting policies first (to be safe)
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- Create the correct policy
CREATE POLICY "Users can insert their own payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also ensure they can read their own payments (for the receipt)
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;

CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

