-- Base clinics table (required by all other tables)
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_name ON public.clinics(name);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Clinics RLS: users can view clinics they belong to
CREATE POLICY "Users can view clinics they belong to"
  ON public.clinics FOR SELECT
  USING (
    id IN (
      SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid()
    )
  );
