-- Add product_id and subscription_end columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN product_id text,
ADD COLUMN subscription_end timestamp with time zone;