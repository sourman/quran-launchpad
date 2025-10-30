-- Fix RLS policies to allow complete onboarding flow
-- This addresses the 403 error and RLS violations during signup/onboarding

-- ============================================
-- INSTITUTIONS TABLE
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Institution admins can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Allow institution creation during signup" ON public.institutions;
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can update their institution" ON public.institutions;

-- Allow authenticated users to INSERT institutions during onboarding
CREATE POLICY "Allow authenticated users to create institutions"
  ON public.institutions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to SELECT their own institution
-- This is needed right after creation during onboarding
CREATE POLICY "Users can view institutions they created"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (
    contact_email = auth.email() OR
    id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow institution admins to UPDATE their institution
CREATE POLICY "Institution admins can update their institution"
  ON public.institutions FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT institution_id FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'institution_admin'
    )
  );

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can view their own profile
-- (This should already exist, but ensuring it's correct)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- ============================================
-- USER_ROLES TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role creation during signup" ON public.user_roles;

-- Allow authenticated users to INSERT roles during onboarding
-- We trust the application logic here since this happens right after institution creation
CREATE POLICY "Allow authenticated users to create roles during onboarding"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- ADDITIONAL SAFETY
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON POLICY "Allow authenticated users to create institutions" ON public.institutions IS 
  'Allows any authenticated user to create an institution during signup/onboarding';
COMMENT ON POLICY "Users can view institutions they created" ON public.institutions IS 
  'Allows users to view institutions they created (by email) or are members of (via profiles)';
