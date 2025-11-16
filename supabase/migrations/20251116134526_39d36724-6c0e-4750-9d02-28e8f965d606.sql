-- Add email notifications preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN receive_emails boolean NOT NULL DEFAULT true;

-- Update the handle_new_user function to include email notifications preference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, state_residency, receive_emails)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'state_residency',
    COALESCE((new.raw_user_meta_data->>'receive_emails')::boolean, true)
  );
  RETURN new;
END;
$$;