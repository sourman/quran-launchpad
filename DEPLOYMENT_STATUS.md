# Deployment Status

## ✅ Completed Steps

### 1. Database Setup
- **Status**: ✅ Complete
- **Project**: Quran Place Backend (nqdznclpnizsyjxbxgxo)
- **Region**: Canada (Central)
- **Migrations Pushed**: Yes
  - `20251025000000_create_classes_and_students.sql` (classes, students, RLS policies)
  - `20251028022257_adding_new_table.sql` (empty migration)

### 2. Edge Functions Deployed
- **Status**: ✅ Complete
- ✅ `create-class` - Creates Stripe products/prices/payment links
- ✅ `stripe-webhook` - Handles Stripe webhook events

### 3. Project Configuration
- **Project ID**: `nqdznclpnizsyjxbxgxo`
- **Project URL**: `https://nqdznclpnizsyjxbxgxo.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZHpuY2xwbml6c3lqeGJ4Z3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTg0MDAsImV4cCI6MjA3Njg5NDQwMH0.SAYoH4DlmEA2mIEsK93xhABlZQcMrZ-Z7BU_sXh0qN4`

---

## 🔴 Required: Stripe Configuration

### Step 1: Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test Secret Key** (starts with `sk_test_...`)

### Step 2: Set Stripe Secret in Supabase
Run this command with your actual Stripe key:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE --project-ref nqdznclpnizsyjxbxgxo
```

### Step 3: Configure Stripe Webhook
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Set endpoint URL to:
   ```
   https://nqdznclpnizsyjxbxgxo.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)

### Step 4: Set Webhook Secret in Supabase
Run this command with your webhook signing secret:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE --project-ref nqdznclpnizsyjxbxgxo
```

---

## 🔴 Required: Update Frontend Environment Variables

Your `.env` file needs to be updated with the correct project credentials:

```env
VITE_SUPABASE_PROJECT_ID="nqdznclpnizsyjxbxgxo"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZHpuY2xwbml6c3lqeGJ4Z3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTg0MDAsImV4cCI6MjA3Njg5NDQwMH0.SAYoH4DlmEA2mIEsK93xhABlZQcMrZ-Z7BU_sXh0qN4"
VITE_SUPABASE_URL="https://nqdznclpnizsyjxbxgxo.supabase.co"
```

---

## 🧪 Testing the Flow

Once Stripe is configured:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Create an institution**:
   - Go to `/institution-signup`
   - Create a test institution account

3. **Login**:
   - Go to `/auth`
   - Login with your institution credentials

4. **Create a class**:
   - Click "Add New Class"
   - Enter class name and monthly price
   - Copy the generated payment link

5. **Test payment**:
   - Open the payment link in a new tab
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete the checkout

6. **Verify student enrollment**:
   - Return to dashboard
   - Click on the class
   - Student should appear in the list

---

## 📊 Dashboard Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo
- **Edge Functions**: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo/functions
- **Database**: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo/editor
- **Stripe Dashboard**: https://dashboard.stripe.com/test/dashboard

---

## ⚠️ Important Notes

1. **Old Project ID**: Your `.env.example` references `tgviuvoizjbqweteytyr` but you don't have access to it. The correct project is `nqdznclpnizsyjxbxgxo`.

2. **Secrets Required**: The Edge Functions will fail until you set both Stripe secrets in Supabase.

3. **Webhook Testing**: Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to https://nqdznclpnizsyjxbxgxo.supabase.co/functions/v1/stripe-webhook
   ```

---

## Next Steps Summary

1. ✅ Database migrations pushed
2. ✅ Edge functions deployed
3. 🔴 Set `STRIPE_SECRET_KEY` in Supabase secrets
4. 🔴 Configure Stripe webhook endpoint
5. 🔴 Set `STRIPE_WEBHOOK_SECRET` in Supabase secrets
6. 🔴 Update `.env` file with correct project credentials
7. 🧪 Test the complete flow
