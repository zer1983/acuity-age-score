-- Add missing fields to existing tables to match specification

-- Add missing fields to patients table
ALTER TABLE public.patients 
ADD COLUMN discharge_date date,
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'discharged'));

-- Add missing fields to assessments table  
ALTER TABLE public.assessments
ADD COLUMN shift text DEFAULT 'morning' CHECK (shift IN ('morning', 'evening')),
ADD COLUMN assessment_data jsonb,
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Add hospital support to units table
ALTER TABLE public.units
ADD COLUMN hospital_id uuid DEFAULT gen_random_uuid();

-- Update profiles table to match user specification
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE,
ALTER COLUMN role SET DEFAULT 'unit_admin',
ADD COLUMN unit_id uuid REFERENCES public.units(id);

-- Add constraint to ensure role matches permissions
ALTER TABLE public.profiles 
ADD CONSTRAINT check_unit_admin_has_unit 
CHECK (
  (role = 'hospital_admin' AND unit_id IS NULL) OR 
  (role = 'unit_admin' AND unit_id IS NOT NULL) OR
  (role = 'user')
);

-- Update bed status field to match specification
ALTER TABLE public.beds 
ADD COLUMN bed_status text DEFAULT 'available' CHECK (bed_status IN ('occupied', 'available'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_assessments_shift ON public.assessments(shift);
CREATE INDEX IF NOT EXISTS idx_assessments_date_shift ON public.assessments(assessment_date, shift);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_unit_id ON public.profiles(unit_id);

-- Update RLS policies for enhanced role-based access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Hospital admin can view all profiles, unit admins can view their unit's profiles
CREATE POLICY "Role-based profile access" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'unit_admin' AND
    unit_id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update units policies for hospital admin access
DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;

CREATE POLICY "Hospital admins can manage units" ON public.units
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin'
);

CREATE POLICY "Unit admins can view their unit" ON public.units  
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Update rooms policies  
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;

CREATE POLICY "Unit admins can manage their unit rooms" ON public.rooms
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  unit_id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Update beds policies
DROP POLICY IF EXISTS "Admins can manage beds" ON public.beds;
DROP POLICY IF EXISTS "Authenticated users can view beds" ON public.beds;

CREATE POLICY "Unit admins can manage their unit beds" ON public.beds
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  room_id IN (
    SELECT id FROM public.rooms 
    WHERE unit_id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Update patients policies
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON public.patients;

CREATE POLICY "Unit admins can manage their unit patients" ON public.patients
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  unit_id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Update assessments policies for role-based access
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;

CREATE POLICY "Role-based assessment access" ON public.assessments
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin' OR
  (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'unit_admin' AND
    unit_id = (SELECT unit_id FROM public.profiles WHERE user_id = auth.uid())
  ) OR
  user_id = auth.uid()
);

CREATE POLICY "Unit staff can create assessments" ON public.assessments  
FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('hospital_admin', 'unit_admin', 'user') AND
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own assessments" ON public.assessments
FOR UPDATE USING (
  user_id = auth.uid() OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hospital_admin'
);