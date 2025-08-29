-- ===============================================================
-- PATIENT ASSESSMENT TOOL - USER SETUP SCRIPT
-- Run this SQL in your Supabase SQL Editor
-- ===============================================================

-- Step 1: Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'hospital_admin', 'system_admin')),
  unit_id UUID REFERENCES public.units(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
CREATE POLICY "Authenticated users can view users" 
ON public.users 
FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" 
ON public.users 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'hospital_admin', 'system_admin')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'hospital_admin', 'system_admin')
));

-- Step 4: Create trigger for updated_at (if function exists)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Insert predefined users
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
('doctor.pediatrics@hospital.com', 'Pediatrics Doctor', 'user')
ON CONFLICT (email) DO NOTHING;

-- Step 6: Update profiles table to support new roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'hospital_admin', 'system_admin'));

-- Update existing profiles to use new role system
UPDATE public.profiles 
SET role = 'user' 
WHERE role NOT IN ('user', 'admin', 'hospital_admin', 'system_admin');

-- ===============================================================
-- SUCCESS MESSAGE
-- ===============================================================
DO $$
BEGIN
  RAISE NOTICE 'Users table created successfully!';
  RAISE NOTICE 'Total users inserted: %', (SELECT COUNT(*) FROM public.users);
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run the auth_users_setup.sql script to create authentication users';
  RAISE NOTICE 'All users will have the default password: 123123';
END $$;