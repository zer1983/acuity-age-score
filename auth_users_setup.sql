-- ===============================================================
-- AUTHENTICATION SETUP SCRIPT
-- Run this AFTER running create_users_setup.sql
-- This creates auth.users and profiles for all predefined users
-- ===============================================================

-- Create a function to manually create auth users
CREATE OR REPLACE FUNCTION create_auth_users_for_predefined()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    user_id UUID;
BEGIN
    -- Loop through all users in the users table
    FOR user_record IN SELECT * FROM public.users LOOP
        -- Generate a UUID for this user if needed, or use existing
        user_id := user_record.id;
        
        -- Create auth user (skip if already exists)
        BEGIN
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
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                user_id,
                'authenticated',
                'authenticated',
                user_record.email,
                crypt('123123', gen_salt('bf')),
                now(),
                now(),
                now(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('full_name', user_record.full_name, 'role', user_record.role),
                user_record.created_at,
                user_record.updated_at,
                '',
                '',
                '',
                ''
            );
            
            RAISE NOTICE 'Created auth user for: %', user_record.email;
        EXCEPTION
            WHEN unique_violation THEN
                RAISE NOTICE 'Auth user already exists for: %', user_record.email;
        END;
        
        -- Create profile (skip if already exists)
        BEGIN
            INSERT INTO public.profiles (user_id, full_name, email, role)
            VALUES (user_id, user_record.full_name, user_record.email, user_record.role);
            
            RAISE NOTICE 'Created profile for: %', user_record.email;
        EXCEPTION
            WHEN unique_violation THEN
                -- Update existing profile
                UPDATE public.profiles 
                SET full_name = user_record.full_name,
                    email = user_record.email,
                    role = user_record.role,
                    updated_at = now()
                WHERE user_id = user_id;
                
                RAISE NOTICE 'Updated profile for: %', user_record.email;
        END;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== AUTHENTICATION SETUP COMPLETE ===';
    RAISE NOTICE 'Total auth users: %', (SELECT COUNT(*) FROM auth.users WHERE instance_id = '00000000-0000-0000-0000-000000000000');
    RAISE NOTICE 'Total profiles: %', (SELECT COUNT(*) FROM public.profiles);
    RAISE NOTICE '';
    RAISE NOTICE 'All users can now log in with password: 123123';
    RAISE NOTICE '';
    RAISE NOTICE 'Test accounts:';
    RAISE NOTICE '- System Admin: system.admin@hospital.com';
    RAISE NOTICE '- Hospital Admin: hospital.admin@hospital.com';
    RAISE NOTICE '- Unit Admin: unit.admin.icu@hospital.com';
    RAISE NOTICE '- Regular User: nurse.icu1@hospital.com';
END;
$$;

-- Execute the function
SELECT create_auth_users_for_predefined();

-- Clean up - drop the temporary function
DROP FUNCTION create_auth_users_for_predefined();

-- Final verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Users table records: %', (SELECT COUNT(*) FROM public.users);
    RAISE NOTICE 'Auth users created: %', (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@hospital.com');
    RAISE NOTICE 'Profiles created: %', (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@hospital.com');
    RAISE NOTICE '';
    RAISE NOTICE 'Setup complete! You can now test login with any user email and password "123123"';
END $$;