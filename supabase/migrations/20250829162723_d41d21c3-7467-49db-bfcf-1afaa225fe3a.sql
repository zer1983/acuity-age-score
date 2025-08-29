-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  unit_id UUID REFERENCES public.units(id),
  room_id UUID REFERENCES public.rooms(id), 
  bed_id UUID REFERENCES public.beds(id),
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view patients"
ON public.patients FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create patients"
ON public.patients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients"
ON public.patients FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete patients"
ON public.patients FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add patient_id to assessments table
ALTER TABLE public.assessments 
ADD COLUMN patient_id UUID REFERENCES public.patients(id);

-- Create index for better performance
CREATE INDEX idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX idx_patients_unit_room_bed ON public.patients(unit_id, room_id, bed_id);