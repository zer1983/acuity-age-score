-- Simple Authentication Setup Script v2
-- Run this after create_users_setup.sql
-- This script creates profiles for all users and sets up basic authentication

-- Step 1: Create profiles for all users in the users table
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Step 2: Show what we created
SELECT 
    'Profiles created' as status,
    COUNT(*) as count
FROM public.profiles 
WHERE email LIKE '%@hospital.com'

UNION ALL

SELECT 
    'Users in users table' as status,
    COUNT(*) as count
FROM public.users;

-- Step 3: Display all available users for manual auth setup
SELECT 
    'Available users for manual auth setup:' as info,
    '' as email,
    '' as password,
    '' as role
UNION ALL
SELECT 
    'Email' as info,
    email,
    '123123' as password,
    role
FROM public.users
ORDER BY info DESC, email;