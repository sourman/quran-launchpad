# Deployment Steps - Execute These Manually

## Step 1: Get Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name (e.g., "QuranPlace CLI")
4. Copy the token (starts with `sbp_...`)

## Step 2: Set the Token

Run in your terminal:
```bash
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_TOKEN_HERE"
```

Or use the login command:
```bash
supabase login --token sbp_YOUR_TOKEN_HERE
```

## Step 3: Link Project

```bash
cd /Users/hythamdefrawy/Projects/quran-launchpad
supabase link --project-ref tgviuvoizjbqweteytyr
```

When prompted for database password, get it from:
- Supabase Dashboard → Project Settings → Database → Connection string
- Or use the password you set when creating the project

## Step 4: Run Migrations

```bash
supabase db push
```

This will create the `classes` and `students` tables.

## Step 5: Get Stripe Keys

### Get Secret Key:
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_...`)

### Get Publishable Key (optional for frontend):
1. Copy **Publishable key** (starts with `pk_test_...`)
2. Add to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

## Step 6: Set Supabase Secrets

Go to: https://supabase.com/dashboard/project/tgviuvoizjbqweteytyr/settings/functions

Add these secrets:
- **Name:** `STRIPE_SECRET_KEY`
  **Value:** `sk_test_...` (from Step 5)

(We'll add `STRIPE_WEBHOOK_SECRET` after creating the webhook)

## Step 7: Deploy Edge Functions

```bash
supabase functions deploy create-class
supabase functions deploy stripe-webhook
```

After deployment, note the URLs:
- `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/create-class`
- `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/stripe-webhook`

## Step 8: Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/stripe-webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **"Add endpoint"**
6. Click on the newly created webhook
7. Copy the **Signing secret** (starts with `whsec_...`)

## Step 9: Add Webhook Secret to Supabase

Go back to: https://supabase.com/dashboard/project/tgviuvoizjbqweteytyr/settings/functions

Add secret:
- **Name:** `STRIPE_WEBHOOK_SECRET`
  **Value:** `whsec_...` (from Step 8)

## Step 10: Fix Missing Role (If You Already Signed Up)

If you signed up before running migrations, you need to add the role manually:

1. Go to: https://supabase.com/dashboard/project/tgviuvoizjbqweteytyr/editor
2. Click **SQL Editor** → **New Query**
3. Run:
   ```sql
   -- Find your user ID
   SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';
   
   -- Find your institution ID
   SELECT id, name FROM public.institutions WHERE contact_email = 'YOUR_EMAIL';
   
   -- Add the role (replace with your actual IDs)
   INSERT INTO public.user_roles (user_id, role, institution_id)
   VALUES (
     'YOUR_USER_ID',
     'institution_admin',
     'YOUR_INSTITUTION_ID'
   );
   ```

## Step 11: Test the Application

```bash
npm run dev
```

### Test Flow:
1. **Visit:** `http://localhost:5173/diagnostic`
   - Click "Run Diagnostics"
   - All checks should pass ✅

2. **Sign up (if new):** `http://localhost:5173/institution-signup`
   - Create institution
   - Should redirect to `/dashboard`

3. **Or login:** `http://localhost:5173/auth`
   - Use existing credentials
   - Should redirect to `/dashboard`

4. **Create a class:**
   - Click "Add New Class"
   - Enter: Name = "Test Class", Price = 10.00
   - Click "Create Class"
   - Should see payment link appear

5. **Copy payment link:**
   - Click "Copy Link"
   - Open in new incognito window

6. **Test payment:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Complete checkout

7. **Verify student enrolled:**
   - Go back to dashboard
   - Click on the class name
   - Should see the student in the list

---

## Troubleshooting

### "No institution found for user"
- Run Step 10 to add the missing role
- Or visit `/diagnostic` to check what's wrong

### "Failed to create class"
- Check browser console for errors
- Verify Stripe secret is set in Supabase
- Check Edge Function logs in Supabase Dashboard

### "Student not appearing"
- Check Stripe webhook events: https://dashboard.stripe.com/test/webhooks
- Check Edge Function logs for `stripe-webhook`
- Verify webhook secret is correct

---

## Quick Commands Reference

```bash
# Login
export SUPABASE_ACCESS_TOKEN="sbp_..."
# or
supabase login --token sbp_...

# Link
supabase link --project-ref tgviuvoizjbqweteytyr

# Migrate
supabase db push

# Deploy functions
supabase functions deploy create-class
supabase functions deploy stripe-webhook

# Start dev server
npm run dev
```

---

## Next Steps After Testing

Once everything works:
1. Update `.gitignore` to exclude `.env`
2. Document your Stripe test mode vs production mode setup
3. Consider adding more features (see IMPLEMENTATION_SUMMARY.md)
