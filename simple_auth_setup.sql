-- Simple Authentication Setup Script
-- Run this after create_users_setup.sql

-- Create auth users for each predefined user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    u.id,
    'authenticated',
    'authenticated',
    u.email,
    crypt('123123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', u.full_name, 'role', u.role),
    u.created_at,
    u.updated_at,
    '',
    '',
    '',
    ''
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = u.email
);

-- Create profiles for each user
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

-- Show results
SELECT 
    'Users created' as status,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Auth users created' as status,
    COUNT(*) as count
FROM auth.users 
WHERE email LIKE '%@hospital.com'
UNION ALL
SELECT 
    'Profiles created' as status,
    COUNT(*) as count
FROM public.profiles 
WHERE email LIKE '%@hospital.com';