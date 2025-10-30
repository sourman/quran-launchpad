-- Fix RLS policies to allow institution signup

-- Allow authenticated users to insert institutions (for signup)
CREATE POLICY "Authenticated users can create institutions"
  ON public.institutions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert their own user_roles (for signup)
CREATE POLICY "Users can insert their own roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
