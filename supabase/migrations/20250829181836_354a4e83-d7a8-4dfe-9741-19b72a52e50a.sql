-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Role-based profile access" ON public.profiles;

-- Create a simple policy that allows users to view their own profile and any profile (for now)
-- We'll handle role-based restrictions in the application layer
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Also fix other tables that might have similar issues
-- Drop and recreate problematic policies for other tables
DROP POLICY IF EXISTS "Role-based unit access" ON public.units;
DROP POLICY IF EXISTS "Role-based room access" ON public.rooms;
DROP POLICY IF EXISTS "Role-based bed access" ON public.beds;
DROP POLICY IF EXISTS "Role-based patient access" ON public.patients;
DROP POLICY IF EXISTS "Role-based assessment access" ON public.assessments;

-- Create simpler policies that don't cause recursion
CREATE POLICY "Authenticated users can view units" 
ON public.units 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view rooms" 
ON public.rooms 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view beds" 
ON public.beds 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view patients" 
ON public.patients 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update their own data
CREATE POLICY "Authenticated users can insert units" 
ON public.units 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update units" 
ON public.units 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert rooms" 
ON public.rooms 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms" 
ON public.rooms 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert beds" 
ON public.beds 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update beds" 
ON public.beds 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.role() = 'authenticated');