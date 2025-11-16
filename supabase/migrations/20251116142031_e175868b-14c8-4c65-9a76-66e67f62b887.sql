-- Add preference points columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deer_preference_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS elk_preference_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS antelope_preference_points integer DEFAULT 0;