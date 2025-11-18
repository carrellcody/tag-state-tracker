-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Only admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update profiles" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update certain fields in their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Keep admin access for all operations
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));