-- Add promo code tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS promo_code_used text,
ADD COLUMN IF NOT EXISTS promo_code_applied_at timestamp with time zone;