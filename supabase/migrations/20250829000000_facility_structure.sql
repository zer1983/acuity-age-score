-- Facility structure: units, rooms, beds

-- Units table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms table (belongs to unit)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, name)
);

-- Beds table (belongs to room)
CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, label)
);

-- Link assessments to unit/room/bed
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_unit_id ON public.rooms(unit_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_assessments_unit_id ON public.assessments(unit_id);
CREATE INDEX IF NOT EXISTS idx_assessments_room_id ON public.assessments(room_id);
CREATE INDEX IF NOT EXISTS idx_assessments_bed_id ON public.assessments(bed_id);

-- Enable RLS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- Policies: read-only public for structure (optional). If you prefer per-user, adjust accordingly.
CREATE POLICY IF NOT EXISTS "Allow read units" ON public.units FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read beds" ON public.beds FOR SELECT USING (true);

-- Optional: allow admins to manage structure. Adjust role check as needed.
-- CREATE POLICY "Allow insert/update/delete for service role" ON public.units FOR ALL USING (false) WITH CHECK (false);

