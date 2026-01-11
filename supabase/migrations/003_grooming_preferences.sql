-- Add grooming preferences to dogs table
-- Run this SQL in your Supabase SQL Editor

-- Add grooming_preferences JSONB column to store structured preferences
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS grooming_preferences JSONB DEFAULT '{}'::jsonb;

-- Example structure for grooming_preferences:
-- {
--   "clipping_length": "5mm",
--   "clipping_notes": "Shorter on belly",
--   "nail_clipper_size": "medium",
--   "nail_tool": "clipper",
--   "coat_notes": "Heavy shedder, matting behind ears",
--   "behavior_notes": "Anxious, doesn't like paws touched",
--   "special_instructions": "Use calming spray before grooming"
-- }

-- Create index for faster JSONB queries if needed
CREATE INDEX IF NOT EXISTS idx_dogs_grooming_preferences ON dogs USING gin (grooming_preferences);
