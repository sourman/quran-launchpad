# RLS Policy Fix Summary

## Problem
The onboarding flow was failing with:
- **Error**: "new row violates row-level security for table institutions"
- **HTTP 403**: Failed to load resource from `/rest/v1/institutions?select=*`

## Root Cause
The RLS policies on the `institutions` table were too restrictive:
1. **Missing SELECT policy**: No policy allowed authenticated users to view institutions during/after creation
2. **Restrictive existing policy**: The old SELECT policy only allowed users who were already institution admins to view, but during onboarding the user hasn't been assigned the role yet (chicken-and-egg problem)

## Solution Applied
Created migration: `20251030000000_fix_onboarding_rls_complete.sql`

### Key Changes

#### 1. Institutions Table
- ✅ **INSERT Policy**: Allow any authenticated user to create institutions
  ```sql
  CREATE POLICY "Allow authenticated users to create institutions"
    ON public.institutions FOR INSERT
    TO authenticated
    WITH CHECK (true);
  ```

- ✅ **SELECT Policy**: Allow users to view institutions they created OR are members of
  ```sql
  CREATE POLICY "Users can view institutions they created"
    ON public.institutions FOR SELECT
    TO authenticated
    USING (
      contact_email = auth.email() OR
      id IN (
        SELECT institution_id FROM public.profiles WHERE id = auth.uid()
      )
    );
  ```

- ✅ **UPDATE Policy**: Only institution admins can update
  ```sql
  CREATE POLICY "Institution admins can update their institution"
    ON public.institutions FOR UPDATE
    TO authenticated
    USING (
      id IN (
        SELECT institution_id FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'institution_admin'
      )
    );
  ```

#### 2. Profiles Table
- ✅ Users can INSERT their own profile (`id = auth.uid()`)
- ✅ Users can SELECT their own profile
- ✅ Users can UPDATE their own profile

#### 3. User Roles Table
- ✅ Users can INSERT their own roles during onboarding (`user_id = auth.uid()`)
- ✅ Users can SELECT their own roles

## Testing
Now you can test the complete onboarding flow:

1. **Sign Up** at `/institution-signup`
   - Email: `hythamdefrawy+ob6@gmail.com`
   - Password: (min 8 characters)

2. **Confirm Email** via link sent to inbox

3. **Complete Onboarding** at `/onboarding`
   - Institution Name: e.g., "Test Institution OB6"
   - Full Name: e.g., "Hytham Defrawy"

4. **Access Dashboard** - Should redirect successfully

## Status
✅ Migration applied successfully to Supabase project: `nqdznclpnizsyjxbxgxo`

The 403 error and RLS violations should now be resolved.
