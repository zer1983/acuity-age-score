# Manual Authentication Setup Guide

Since the automated auth setup script has syntax issues, here's how to manually create authentication users through the Supabase dashboard.

## Step 1: Run the Basic Setup Scripts

1. **Run `create_users_setup.sql`** - This creates the users table and inserts all users
2. **Run `simple_auth_setup_v2.sql`** - This creates profiles for all users

## Step 2: Manual Auth User Creation

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Users** tab
4. Click **Add User** button
5. For each user, enter:
   - **Email:** (from the users table)
   - **Password:** 123123
   - **Email Confirm:** Check this box
6. Click **Create User**

### Option B: Using Supabase CLI (if available)

```bash
# For each user, run:
supabase auth admin create-user \
  --email system.admin@hospital.com \
  --password 123123 \
  --email-confirm
```

## Step 3: Users to Create Manually

Here are all the users you need to create in the auth system:

### System Administrators
- **Email:** system.admin@hospital.com
- **Password:** 123123
- **Role:** system_admin

### Hospital Administrators
- **Email:** hospital.admin@hospital.com
- **Password:** 123123
- **Role:** hospital_admin

### Unit Administrators
- **Email:** unit.admin.icu@hospital.com
- **Password:** 123123
- **Role:** admin

- **Email:** unit.admin.er@hospital.com
- **Password:** 123123
- **Role:** admin

- **Email:** unit.admin.ward@hospital.com
- **Password:** 123123
- **Role:** admin

### Regular Users (Nurses/Staff)
- **Email:** nurse.icu1@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.icu2@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.er1@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.er2@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward1@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward2@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward3@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward4@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward5@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward6@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward7@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward8@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward9@hospital.com
- **Password:** 123123
- **Role:** user

- **Email:** nurse.ward10@hospital.com
- **Password:** 123123
- **Role:** user

## Step 4: Verification

After creating all auth users, verify the setup:

```sql
-- Check that profiles exist
SELECT email, role FROM public.profiles WHERE email LIKE '%@hospital.com';

-- Check that auth users exist
SELECT email FROM auth.users WHERE email LIKE '%@hospital.com';
```

## Step 5: Test Login

Try logging into your application with:
- **Email:** system.admin@hospital.com
- **Password:** 123123

## Quick Setup Script

If you want to see all the users you need to create, run this query:

```sql
SELECT 
    email,
    '123123' as password,
    role
FROM public.users
ORDER BY role, email;
```

This will give you a list of all emails and their roles for easy copy-paste into the Supabase dashboard.

## Troubleshooting

### If users can't log in:
1. Make sure the auth user was created in Supabase Authentication
2. Verify the profile exists in the profiles table
3. Check that the email and password match exactly
4. Ensure the user's email is confirmed in the auth system

### If roles aren't working:
1. Check that the profiles table has the correct role for each user
2. Verify that the role matches one of: 'user', 'admin', 'hospital_admin', 'system_admin'
3. Make sure the application is reading from the profiles table correctly