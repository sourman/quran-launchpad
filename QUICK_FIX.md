# Quick Fix: "No institution found for user"

## Problem
You're getting this error when trying to access the dashboard:
```
Error: No institution found for user
```

## Root Cause
The `user_roles` table doesn't have an entry linking your user to your institution with the `institution_admin` role.

---

## Solution: Use the Diagnostic Tool

### Step 1: Run the Diagnostic Tool
1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:5173/diagnostic`
3. Click **"Run Diagnostics"**
4. Review the results

### Step 2: Interpret Results

**If "User Roles" shows FAIL:**
- You need to manually add the role in Supabase

**If "Classes Table" shows FAIL:**
- You need to run migrations first

---

## Manual Fix in Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `tgviuvoizjbqweteytyr`

2. **Open SQL Editor:**
   - Left sidebar → **SQL Editor**
   - Click **New Query**

3. **Find Your IDs:**
   ```sql
   -- Find your user ID
   SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
   
   -- Find your institution ID
   SELECT id, name FROM public.institutions WHERE contact_email = 'YOUR_EMAIL_HERE';
   ```
   
   Copy both IDs (they look like: `123e4567-e89b-12d3-a456-426614174000`)

4. **Add the Missing Role:**
   ```sql
   INSERT INTO public.user_roles (user_id, role, institution_id)
   VALUES (
     'PASTE_USER_ID_HERE',
     'institution_admin',
     'PASTE_INSTITUTION_ID_HERE'
   );
   ```

5. **Verify:**
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = 'PASTE_USER_ID_HERE';
   ```
   
   Should return 1 row with role = `institution_admin`

6. **Refresh your browser** and try accessing `/dashboard` again

---

## Option B: Run Migrations First (If Tables Don't Exist)

### Check if migrations are needed:
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('classes', 'students');
```

**If no results:** You need to run migrations.

### Run Migrations:

#### Method 1: Using Supabase CLI (if installed)
```bash
npm install -g supabase
supabase link --project-ref tgviuvoizjbqweteytyr
supabase db push
```

#### Method 2: Manual SQL (if CLI not available)
1. Open: `supabase/migrations/20251025000000_create_classes_and_students.sql`
2. Copy the entire contents
3. Go to **Supabase Dashboard** → **SQL Editor**
4. Paste and run the SQL
5. Check for errors in the output

---

## Option C: Create New Institution (Fresh Start)

If the above is too complex:

1. **Sign out** from the app
2. Go to: `http://localhost:5173/institution-signup`
3. Use a **different email** (e.g., add `+test` to your email: `you+test@gmail.com`)
4. Complete signup
5. Go to `/diagnostic` and verify all checks pass
6. Try accessing `/dashboard`

---

## Verification Checklist

After applying the fix, verify:

- [ ] Go to `http://localhost:5173/diagnostic`
- [ ] Click "Run Diagnostics"
- [ ] All checks should show green checkmarks:
  - ✅ Authentication
  - ✅ User Roles
  - ✅ Institution
  - ✅ Profile
  - ✅ Classes Table
  - ✅ Students Table
- [ ] Go to `/dashboard` - should load without errors
- [ ] Try clicking "Add New Class" - dialog should open

---

## Still Not Working?

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Share the error message for further help

### Check Supabase Logs
1. **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Look for errors around the time you tried to access dashboard

### Common Issues

**Error: "relation 'public.user_roles' does not exist"**
- Solution: Run migrations (Option B above)

**Error: "new row violates row-level security policy"**
- Solution: Check RLS policies are correct in migration files

**Error: "duplicate key value violates unique constraint"**
- Solution: Role already exists, just refresh the page

---

## Prevention

To avoid this in the future:

1. **Always run migrations before first signup:**
   ```bash
   supabase db push
   ```

2. **Use the diagnostic tool after signup:**
   - Go to `/diagnostic` immediately after creating institution
   - Verify all checks pass

3. **Keep migrations in sync:**
   - When pulling code changes, always run `supabase db push`

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| `/diagnostic` | Check database setup |
| `/institution-signup` | Create new institution |
| `/auth` | Login |
| `/dashboard` | Main dashboard (requires role) |

---

## Need More Help?

1. Run `/diagnostic` and screenshot the results
2. Check browser console for errors
3. Check Supabase SQL Editor for table existence
4. Refer to `TROUBLESHOOTING.md` for detailed solutions
