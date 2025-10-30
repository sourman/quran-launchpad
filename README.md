# Quran Launchpad

A modern institution management platform for Quran education centers, built with React, TypeScript, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/903a4067-9c79-4a6e-bf78-72970b85f317
**Supabase Project**: `nqdznclpnizsyjxbxgxo`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/903a4067-9c79-4a6e-bf78-72970b85f317) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React
- **UI**: shadcn-ui, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/903a4067-9c79-4a6e-bf78-72970b85f317) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Authentication & Onboarding Flow

### User Sign-Up Process

1. **Sign Up** (`/institution-signup`)
   - User creates account with email and password
   - Email confirmation link is sent

2. **Email Verification**
   - User clicks confirmation link from email
   - Account is verified and activated

3. **Onboarding** (`/onboarding`)
   - User provides institution details:
     - Institution Name
     - Full Name
   - System creates:
     - Institution record
     - User profile
     - Institution admin role

4. **Dashboard Access** (`/dashboard`)
   - User is redirected to dashboard
   - Full access to institution management features

### Testing Sign-Up Flow

To test with an email alias (useful for multiple test accounts):

```
Email: youremail+test1@gmail.com
Password: (minimum 8 characters)
```

Gmail treats `+anything` as the same inbox, so `user+test1@gmail.com` and `user+test2@gmail.com` both deliver to `user@gmail.com`.

---

## Database & Row-Level Security (RLS)

### Supabase Configuration

The project uses Supabase with Row-Level Security (RLS) policies to ensure data isolation and security.

#### Key RLS Policies

**Institutions Table:**
- ✅ Authenticated users can INSERT (create) institutions during onboarding
- ✅ Users can SELECT institutions they created (by email) or are members of
- ✅ Only institution admins can UPDATE their institution

**Profiles Table:**
- ✅ Users can INSERT/SELECT/UPDATE their own profile (`id = auth.uid()`)

**User Roles Table:**
- ✅ Users can INSERT their own roles during onboarding
- ✅ Users can SELECT their own roles

### Common RLS Issues & Solutions

#### Problem: "new row violates row-level security"
**Cause**: Missing or overly restrictive RLS policies

**Solution**: Ensure proper policies exist for the operation:
- `FOR INSERT` with `WITH CHECK` clause
- `FOR SELECT` with `USING` clause
- `FOR UPDATE` with `USING` clause

#### Problem: HTTP 403 on REST API calls
**Cause**: No SELECT policy or user doesn't meet policy conditions

**Solution**: 
1. Check if SELECT policy exists for the table
2. Verify the policy's `USING` clause allows the current user
3. Ensure user is authenticated (not using anon key for protected resources)

### Applying Migrations

Migrations are located in `/supabase/migrations/`. To apply a new migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly via Supabase Dashboard
# SQL Editor > paste migration content > Run
```

**Recent Migrations:**
- `20251030000000_fix_onboarding_rls_complete.sql` - Fixed RLS policies for onboarding flow

### Debugging RLS Issues

1. **Check existing policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'your_table_name';
   ```

2. **Test as specific user:**
   ```sql
   -- In Supabase SQL Editor, policies are bypassed
   -- Test via API or client library to see actual RLS behavior
   ```

3. **Check auth context:**
   ```sql
   SELECT auth.uid(), auth.email();
   ```

4. **Common fixes:**
   - Add missing SELECT policies
   - Use `auth.uid()` for user-specific data
   - Use `auth.email()` for email-based checks
   - Allow `authenticated` role for logged-in users

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

See `.env.example` for reference.

---

## Additional Documentation

- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Deployment configuration and status
- **[RLS_FIX_SUMMARY.md](./RLS_FIX_SUMMARY.md)** - Detailed RLS policy fixes
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
