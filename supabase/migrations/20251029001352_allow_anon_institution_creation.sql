-- Drop the previous policy that only allowed authenticated users
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON public.institutions;

-- Allow both authenticated and anon users to insert institutions (for signup flow)
-- This is safe because signup creates the user first, then the institution
CREATE POLICY "Allow institution creation during signup"
  ON public.institutions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Also update user_roles policy to allow anon (in case session isn't established yet)
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

CREATE POLICY "Allow role creation during signup"
  ON public.user_roles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Profiles policy should already allow insert for authenticated users
-- But let's also allow anon for the signup flow
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles FOR INSERT
  TO anon
  WITH CHECK (true);
