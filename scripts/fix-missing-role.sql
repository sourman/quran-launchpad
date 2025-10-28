-- MANUAL FIX: Run this if you already signed up but don't have a role
-- Replace YOUR_EMAIL with your actual institution email

-- Step 1: Find your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Step 2: Find your institution ID
SELECT id, name FROM public.institutions WHERE contact_email = 'YOUR_EMAIL';

-- Step 3: Insert the missing role (replace the UUIDs with values from steps 1 & 2)
INSERT INTO public.user_roles (user_id, role, institution_id)
VALUES (
  'YOUR_USER_ID_FROM_STEP_1',
  'institution_admin',
  'YOUR_INSTITUTION_ID_FROM_STEP_2'
)
ON CONFLICT (user_id, role, institution_id) DO NOTHING;

-- Step 4: Verify it worked
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID_FROM_STEP_1';
