-- Add manual override column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_manual_override boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.subscription_manual_override IS 'When true, check-subscription will not overwrite subscription_status from Stripe';