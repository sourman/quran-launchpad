# QuranPlace Troubleshooting Guide

## Error: "No institution found for user"

### Cause
The user doesn't have an `institution_admin` role in the `user_roles` table.

### Solution Options

---

## Option 1: Run Migrations (If Not Done Yet)

### Check if migrations are applied:
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('institutions', 'profiles', 'user_roles', 'classes', 'students');
```

**Expected result:** All 5 tables should appear.

**If tables are missing:**
1. Install Supabase CLI: `npm install -g supabase`
2. Link project: `supabase link --project-ref tgviuvoizjbqweteytyr`
3. Push migrations: `supabase db push`

---

## Option 2: Fix Existing User (If You Already Signed Up)

### Step 1: Check Your Data
Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Find your institution
SELECT id, name, contact_email FROM public.institutions;

-- Check if role exists
SELECT * FROM public.user_roles;
```

### Step 2: Add Missing Role
If `user_roles` is empty or missing your entry, run:

```sql
-- Replace with YOUR actual IDs from Step 1
INSERT INTO public.user_roles (user_id, role, institution_id)
VALUES (
  'your-user-id-uuid',
  'institution_admin',
  'your-institution-id-uuid'
);
```

### Step 3: Verify
```sql
SELECT 
  u.email,
  i.name as institution_name,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.institutions i ON ur.institution_id = i.id
WHERE u.email = 'your-email@example.com';
```

**Expected result:** Should show your email, institution name, and role `institution_admin`.

---

## Option 3: Create New Institution (Fresh Start)

If the above doesn't work, create a new test institution:

1. **Sign out** from the app
2. Go to `/institution-signup`
3. Create a **new institution** with a different email
4. After signup, check the database:
```sql
SELECT * FROM public.user_roles ORDER BY created_at DESC LIMIT 1;
```

If the role is created correctly, the issue was with your original signup.

---

## Common Issues

### Issue: "Institution not found" after fixing role
**Cause:** The `institution_id` in `user_roles` doesn't match any institution.

**Fix:**
```sql
-- Check if institution exists
SELECT * FROM public.institutions WHERE id = 'your-institution-id';

-- If missing, create it
INSERT INTO public.institutions (id, name, contact_email)
VALUES (
  'your-institution-id-uuid',
  'Your Institution Name',
  'your-email@example.com'
);
```

---

### Issue: "Cannot add class" / "Failed to create class"
**Causes:**
1. Edge function not deployed
2. Stripe keys not configured
3. CORS issue

**Checks:**
1. **Edge function deployed?**
   - Go to **Supabase Dashboard** → **Edge Functions**
   - Should see `create-class` and `stripe-webhook`
   - If missing, deploy: `supabase functions deploy create-class`

2. **Stripe keys set?**
   - Go to **Supabase Dashboard** → **Edge Functions** → **Secrets**
   - Should have: `STRIPE_SECRET_KEY`
   - If missing, add it from Stripe Dashboard → Developers → API Keys

3. **Check browser console:**
   - Open DevTools → Console
   - Look for specific error messages
   - Common errors:
     - `401 Unauthorized` → Auth token issue
     - `404 Not Found` → Edge function not deployed
     - `500 Internal Server Error` → Check Supabase function logs

---

## Debugging Steps

### 1. Check Authentication
```javascript
// Run in browser console on Dashboard page
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### 2. Check Role Manually
```javascript
// Run in browser console
const { data, error } = await supabase
  .from('user_roles')
  .select('*')
  .eq('user_id', 'YOUR_USER_ID');
console.log('Roles:', data, error);
```

### 3. Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'user_roles';
```

---

## Quick Fix Script

If you want to quickly fix an existing user, use this script in **Supabase SQL Editor**:

```sql
-- REPLACE 'your-email@example.com' with your actual email

DO $$
DECLARE
  v_user_id UUID;
  v_institution_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';
  
  -- Get institution ID
  SELECT id INTO v_institution_id 
  FROM public.institutions 
  WHERE contact_email = 'your-email@example.com';
  
  -- Insert role if missing
  INSERT INTO public.user_roles (user_id, role, institution_id)
  VALUES (v_user_id, 'institution_admin', v_institution_id)
  ON CONFLICT (user_id, role, institution_id) DO NOTHING;
  
  RAISE NOTICE 'Fixed role for user: %', v_user_id;
END $$;
```

---

## Still Not Working?

### Check Supabase Logs
1. Go to **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Look for errors related to `user_roles`, `institutions`, or RLS policies

### Check Edge Function Logs
```bash
# If you have Supabase CLI installed
supabase functions logs create-class
```

Or in **Supabase Dashboard** → **Edge Functions** → Select function → **Logs**

---

## Prevention

To avoid this issue in the future:

1. **Always run migrations before first signup:**
   ```bash
   supabase db push
   ```

2. **Test signup flow:**
   - Create test institution
   - Check `user_roles` table immediately
   - Verify role exists before trying to use dashboard

3. **Add error handling:**
   - The signup page should verify role creation
   - Show clear error if role creation fails

---

## Contact Support

If none of these solutions work:
1. Export your database schema: **Supabase Dashboard** → **Database** → **Schema**
2. Check browser console for errors
3. Check Supabase logs for errors
4. Provide error messages for further debugging
