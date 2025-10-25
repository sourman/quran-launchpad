# QuranPlace Setup Guide

## Overview
QuranPlace is a subscription management platform for Islamic institutions. Institutions can create classes, generate Stripe payment links, and automatically enroll students via webhooks.

---

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account
- Supabase CLI installed (`npm install -g supabase`)

---

## 1. Database Setup

### Run Migrations
```bash
# Link to your Supabase project
supabase link --project-ref tgviuvoizjbqweteytyr

# Run migrations
supabase db push
```

This will create:
- `institutions` table
- `profiles` table
- `user_roles` table
- `classes` table
- `students` table
- RLS policies for multi-tenant security

---

## 2. Stripe Configuration

### Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API Keys**
3. Copy your **Publishable Key** and **Secret Key**

### Add to Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Add to Supabase Edge Functions
1. Go to Supabase Dashboard → **Edge Functions → Secrets**
2. Add these secrets:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET` = (get this after deploying webhook - see step 4)

---

## 3. Deploy Supabase Edge Functions

### Deploy create-class function
```bash
supabase functions deploy create-class
```

### Deploy stripe-webhook function
```bash
supabase functions deploy stripe-webhook
```

### Get Function URLs
After deployment, note the URLs:
- `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/create-class`
- `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/stripe-webhook`

---

## 4. Configure Stripe Webhook

### Add Webhook Endpoint in Stripe
1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add Endpoint**
3. Enter URL: `https://tgviuvoizjbqweteytyr.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add Endpoint**

### Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing Secret** (starts with `whsec_...`)
3. Add it to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

---

## 5. Install Dependencies

```bash
npm install
```

This will install:
- `@stripe/stripe-js` - Stripe frontend SDK
- `stripe` - Stripe backend SDK
- All existing dependencies

---

## 6. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 7. Test the Flow

### Create an Institution
1. Go to `http://localhost:5173/institution-signup`
2. Fill in:
   - Institution Name (e.g., "Al-Azhar University")
   - Your Full Name
   - Contact Email
   - Password
3. Click **Create Institution**
4. Check your email for verification (if email confirmation is enabled)

### Login
1. Go to `http://localhost:5173/auth`
2. Enter your credentials
3. You'll be redirected to `/dashboard`

### Create a Class
1. Click **Add New Class**
2. Enter:
   - Class Name (e.g., "Sharh Al-Bukhari")
   - Monthly Price (e.g., 30.00)
3. Click **Create Class**
4. The system will:
   - Create a Stripe product
   - Create a recurring price
   - Generate a payment link
   - Save to database

### Copy Payment Link
1. Click **Copy Link** next to the class
2. Share this link with students via WhatsApp, email, etc.

### Test Student Enrollment
1. Open the payment link in a new browser/incognito window
2. Complete the Stripe checkout (use test card: `4242 4242 4242 4242`)
3. After payment, the webhook will:
   - Receive the event
   - Extract student info
   - Save to `students` table
4. Refresh the dashboard and click on the class
5. You should see the enrolled student

---

## 8. Production Deployment

### Update Environment Variables
Replace test keys with live keys:
- `VITE_STRIPE_PUBLISHABLE_KEY` → Use `pk_live_...`
- `STRIPE_SECRET_KEY` (in Supabase) → Use `sk_live_...`

### Update Webhook URL
Create a new webhook in Stripe with your production URL

### Deploy Frontend
```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

---

## Database Schema Reference

### institutions
- `id` (uuid, PK)
- `name` (text)
- `logo_url` (text, nullable)
- `contact_email` (text)
- `created_at` (timestamp)

### classes
- `id` (uuid, PK)
- `institution_id` (uuid, FK)
- `name` (text)
- `monthly_price` (numeric)
- `stripe_product_id` (text)
- `stripe_price_id` (text)
- `stripe_payment_link` (text)
- `created_at` (timestamp)

### students
- `id` (uuid, PK)
- `class_id` (uuid, FK)
- `name` (text)
- `email` (text)
- `phone` (text, nullable)
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text, unique)
- `subscription_status` (text: active/canceled/paused)
- `subscribed_since` (timestamp)

---

## Troubleshooting

### Webhook Not Working
1. Check Supabase logs: `supabase functions logs stripe-webhook`
2. Verify webhook secret is correct
3. Test webhook in Stripe Dashboard → Webhooks → Send test webhook

### Class Creation Fails
1. Check browser console for errors
2. Verify Stripe secret key is set in Supabase
3. Check Supabase Edge Function logs: `supabase functions logs create-class`

### Students Not Appearing
1. Check if webhook received the event (Stripe Dashboard → Webhooks → Events)
2. Verify RLS policies allow reading students
3. Check Supabase logs for errors

### Phone Number Not Collected
- Stripe Checkout phone collection is enabled in the payment link creation
- If phone is not provided by student, it will be stored as `null`

---

## Features Implemented

✅ Institution signup and authentication  
✅ Dashboard with class list  
✅ Add new class with automatic Stripe integration  
✅ Copy payment link to clipboard  
✅ Student enrollment via Stripe webhook  
✅ Class detail page with student list  
✅ Phone number collection (optional)  
✅ Subscription status tracking (active/canceled/paused)  
✅ Multi-tenant security with RLS  
✅ Student count display  

---

## Next Steps (Optional Enhancements)

- Add logo upload for institutions
- Export student list to CSV
- Email notifications when students enroll
- Analytics dashboard (revenue, growth charts)
- Bulk class creation
- Custom branding per institution
- Student portal (view their subscriptions)

---

## Support

For issues or questions, check:
- Supabase logs: `supabase functions logs`
- Stripe webhook events: Stripe Dashboard → Webhooks
- Browser console for frontend errors
