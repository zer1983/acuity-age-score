-- Create users table for predefined users
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'hospital_admin', 'system_admin')),
  unit_id UUID REFERENCES public.units(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Authenticated users can view users" 
ON public.users 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage users" 
ON public.users 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'system_admin')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'system_admin')
));

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert predefined users
INSERT INTO public.users (email, full_name, role) VALUES
-- System Admin
('system.admin@hospital.com', 'System Administrator', 'system_admin'),

-- Hospital Admins
('hospital.admin@hospital.com', 'Hospital Administrator', 'hospital_admin'),
('admin.icu@hospital.com', 'ICU Administrator', 'hospital_admin'),
('admin.emergency@hospital.com', 'Emergency Department Administrator', 'hospital_admin'),

-- Unit Admins
('unit.admin.icu@hospital.com', 'ICU Unit Administrator', 'admin'),
('unit.admin.cardio@hospital.com', 'Cardiology Unit Administrator', 'admin'),
('unit.admin.pediatrics@hospital.com', 'Pediatrics Unit Administrator', 'admin'),

-- Regular Users (Nurses, Doctors, etc.)
('nurse.icu1@hospital.com', 'ICU Nurse 1', 'user'),
('nurse.icu2@hospital.com', 'ICU Nurse 2', 'user'),
('nurse.emergency1@hospital.com', 'Emergency Nurse 1', 'user'),
('nurse.emergency2@hospital.com', 'Emergency Nurse 2', 'user'),
('nurse.cardio1@hospital.com', 'Cardiology Nurse 1', 'user'),
('nurse.cardio2@hospital.com', 'Cardiology Nurse 2', 'user'),
('nurse.pediatrics1@hospital.com', 'Pediatrics Nurse 1', 'user'),
('nurse.pediatrics2@hospital.com', 'Pediatrics Nurse 2', 'user'),
('doctor.icu@hospital.com', 'ICU Doctor', 'user'),
('doctor.emergency@hospital.com', 'Emergency Doctor', 'user'),
('doctor.cardio@hospital.com', 'Cardiology Doctor', 'user'),
('doctor.pediatrics@hospital.com', 'Pediatrics Doctor', 'user');

-- Create function to create auth users from users table
CREATE OR REPLACE FUNCTION public.create_auth_user_from_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create auth user with default password "123123"
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
    '00000000-0000-0000-0000-000000000000', -- default instance_id
    NEW.id,
    'authenticated',
    'authenticated',
    NEW.email,
    crypt('123123', gen_salt('bf')), -- default password
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', NEW.full_name, 'role', NEW.role),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  -- Create profile for the user
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (NEW.id, NEW.full_name, NEW.email, NEW.role);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create auth users when users are inserted
CREATE TRIGGER create_auth_user_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_auth_user_from_users();

-- Update the role enum in profiles table to include new roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'hospital_admin', 'system_admin'));

-- Update existing profiles to use new role system
UPDATE public.profiles 
SET role = 'user' 
WHERE role NOT IN ('user', 'admin', 'hospital_admin', 'system_admin');

-- Create function to sync users table with auth.users
CREATE OR REPLACE FUNCTION public.sync_users_with_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert users that don't exist in auth.users yet
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
    SELECT 1 FROM auth.users au WHERE au.id = u.id
  );
  
  -- Insert profiles for users that don't have profiles yet
  INSERT INTO public.profiles (user_id, full_name, email, role)
  SELECT u.id, u.full_name, u.email, u.role
  FROM public.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
  );
END;
$$;

-- Execute the sync function to create auth users for existing users
SELECT public.sync_users_with_auth();