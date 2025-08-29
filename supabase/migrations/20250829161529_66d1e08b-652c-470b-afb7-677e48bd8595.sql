-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  floor_number INTEGER,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  room_type TEXT DEFAULT 'standard',
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create beds table
CREATE TABLE public.beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  bed_type TEXT DEFAULT 'standard',
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unit, room, bed references to assessments table
ALTER TABLE public.assessments 
ADD COLUMN unit_id UUID REFERENCES public.units(id),
ADD COLUMN room_id UUID REFERENCES public.rooms(id),
ADD COLUMN bed_id UUID REFERENCES public.beds(id);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- Create policies for units (read-only for authenticated users)
CREATE POLICY "Authenticated users can view units" 
ON public.units 
FOR SELECT 
TO authenticated
USING (true);

-- Create policies for rooms (read-only for authenticated users)
CREATE POLICY "Authenticated users can view rooms" 
ON public.rooms 
FOR SELECT 
TO authenticated
USING (true);

-- Create policies for beds (read-only for authenticated users)
CREATE POLICY "Authenticated users can view beds" 
ON public.beds 
FOR SELECT 
TO authenticated
USING (true);

-- Admin policies for units (full CRUD)
CREATE POLICY "Admins can manage units" 
ON public.units 
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Admin policies for rooms (full CRUD)
CREATE POLICY "Admins can manage rooms" 
ON public.rooms 
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Admin policies for beds (full CRUD)
CREATE POLICY "Admins can manage beds" 
ON public.beds 
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add triggers for updated_at
CREATE TRIGGER update_units_updated_at
BEFORE UPDATE ON public.units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beds_updated_at
BEFORE UPDATE ON public.beds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.units (name, description, floor_number, capacity) VALUES
('ICU', 'Intensive Care Unit', 3, 20),
('Emergency', 'Emergency Department', 1, 15),
('Cardiology', 'Cardiology Ward', 2, 25),
('Pediatrics', 'Pediatric Ward', 4, 30);

INSERT INTO public.rooms (unit_id, name, room_number, capacity) VALUES
((SELECT id FROM public.units WHERE name = 'ICU' LIMIT 1), 'ICU Room 1', '301', 1),
((SELECT id FROM public.units WHERE name = 'ICU' LIMIT 1), 'ICU Room 2', '302', 2),
((SELECT id FROM public.units WHERE name = 'Emergency' LIMIT 1), 'ER Bay 1', '101', 4),
((SELECT id FROM public.units WHERE name = 'Cardiology' LIMIT 1), 'Cardio Room 1', '201', 2);

INSERT INTO public.beds (room_id, label, bed_number) VALUES
((SELECT id FROM public.rooms WHERE room_number = '301' LIMIT 1), 'Bed A', '301A'),
((SELECT id FROM public.rooms WHERE room_number = '302' LIMIT 1), 'Bed A', '302A'),
((SELECT id FROM public.rooms WHERE room_number = '302' LIMIT 1), 'Bed B', '302B'),
((SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1), 'Bed 1', '101-1'),
((SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1), 'Bed 2', '101-2'),
((SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1), 'Bed A', '201A'),
((SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1), 'Bed B', '201B');