-- Run this in Supabase SQL Editor to check your database state

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('institutions', 'profiles', 'user_roles', 'classes', 'students');

-- 2. Check if your user has a role
SELECT * FROM public.user_roles;

-- 3. Check institutions
SELECT * FROM public.institutions;

-- 4. Check profiles
SELECT * FROM public.profiles;
