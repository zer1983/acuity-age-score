# Quick Setup Instructions for User Management

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query** to create a new SQL query

## Step 2: Create Users Table

Copy and paste the contents of `create_users_setup.sql` into the SQL Editor and click **Run**.

This will:
- ✅ Create the `users` table
- ✅ Set up Row Level Security policies
- ✅ Insert 18 predefined users with different roles
- ✅ Update the profiles table to support new roles

## Step 3: Set Up Authentication

Copy and paste the contents of `auth_users_setup.sql` into the SQL Editor and click **Run**.

This will:
- ✅ Create authentication entries for all users
- ✅ Set default password "123123" for all users
- ✅ Create profiles for all users
- ✅ Enable immediate login access

## Step 4: Verify Setup

After running both scripts, you should see:
- A new `users` table in your database
- 18 users in the table
- Authentication users created
- Success messages in the SQL output

## Step 5: Test Login

Try logging into your application with any of these accounts:

### System Administrator
- **Email:** system.admin@hospital.com
- **Password:** 123123
- **Access:** Full system control

### Hospital Administrator  
- **Email:** hospital.admin@hospital.com
- **Password:** 123123
- **Access:** Hospital-wide management

### Unit Administrator
- **Email:** unit.admin.icu@hospital.com
- **Password:** 123123
- **Access:** ICU unit management

### Regular User
- **Email:** nurse.icu1@hospital.com
- **Password:** 123123
- **Access:** Assessment creation

## Troubleshooting

### If you get an error about missing functions:
- Your database might be missing the `update_updated_at_column()` function
- This is not critical - the users table will still work without automatic timestamp updates

### If users can't log in:
1. Check that both SQL scripts ran successfully
2. Verify users exist in the `users` table
3. Check that auth.users entries were created
4. Ensure profiles were created

### To check if setup worked:
```sql
-- Check users table
SELECT email, role FROM public.users;

-- Check auth users
SELECT email FROM auth.users WHERE email LIKE '%@hospital.com';

-- Check profiles  
SELECT email, role FROM public.profiles WHERE email LIKE '%@hospital.com';
```

## What's Next?

Once setup is complete:
1. Users can immediately log in with their email and password "123123"
2. System admins can manage users through the SystemAdminDashboard
3. You can change user roles directly in Supabase or through the admin interface
4. Encourage users to change their passwords after first login

## Need Help?

If you encounter issues:
1. Check the Supabase logs for any error messages
2. Ensure your project has the required tables (profiles, units, etc.)
3. Verify that RLS is properly configured
4. Make sure you have the necessary permissions to create tables and users