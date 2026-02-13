-- Phase 1: Add new columns for multi-location architecture
-- This maintains backward compatibility while adding support for shared patient records
-- Timestamp: 2026-02-13

-- Step 1: Add location_ids to clinic_members (for location-based access control)
ALTER TABLE public.clinic_members
ADD COLUMN IF NOT EXISTS location_ids uuid[] DEFAULT NULL;

-- Step 2: Add subscription_id to patients (for organization-level patient sharing)
-- Populate it with the subscription_id from the associated clinic
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE;

-- Migrate existing data: populate subscription_id from clinic
UPDATE public.patients p
SET subscription_id = c.subscription_id
FROM public.clinics c
WHERE p.clinic_id = c.id AND p.subscription_id IS NULL;

-- Step 3: Add primary_doctor_id to patients (explicit doctor assignment)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS primary_doctor_id uuid REFERENCES public.clinic_members(id) ON DELETE SET NULL;

-- Step 4: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_patients_subscription_id ON public.patients(subscription_id);
CREATE INDEX IF NOT EXISTS idx_patients_primary_doctor_id ON public.patients(primary_doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_location_ids ON public.clinic_members USING gin(location_ids);

-- Step 5: Add audit log column to clinic_members for tracking access changes
ALTER TABLE public.clinic_members
ADD COLUMN IF NOT EXISTS locations_updated_at timestamptz DEFAULT now();

-- Step 6: Add clinic_location_id alias to appointments (prepare for rename from clinic_id)
-- Note: We keep clinic_id for now to maintain backward compatibility
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS clinic_location_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Initially set clinic_location_id to match clinic_id
UPDATE public.appointments
SET clinic_location_id = clinic_id
WHERE clinic_location_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_location_id ON public.appointments(clinic_location_id);

-- Step 7: Similar changes for other tables
ALTER TABLE public.availability_slots
ADD COLUMN IF NOT EXISTS clinic_location_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

UPDATE public.availability_slots
SET clinic_location_id = clinic_id
WHERE clinic_location_id IS NULL;

ALTER TABLE public.patient_progress
ADD COLUMN IF NOT EXISTS clinic_location_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

UPDATE public.patient_progress
SET clinic_location_id = clinic_id
WHERE clinic_location_id IS NULL;

-- Step 8: Add clinic_location_id to other affected tables
ALTER TABLE public.waitlist_entries
ADD COLUMN IF NOT EXISTS clinic_location_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

UPDATE public.waitlist_entries
SET clinic_location_id = clinic_id
WHERE clinic_location_id IS NULL;

-- Step 9: Add organization-level subscription context to clinic_members for faster access
ALTER TABLE public.clinic_members
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE;

-- Populate subscription_id in clinic_members from the clinic's subscription
UPDATE public.clinic_members cm
SET subscription_id = c.subscription_id
FROM public.clinics c
WHERE cm.clinic_id = c.id AND cm.subscription_id IS NULL;

-- Step 10: Create function to get user's accessible locations
CREATE OR REPLACE FUNCTION get_user_accessible_locations(p_user_id uuid)
RETURNS TABLE(location_id uuid, subscription_id uuid) AS $$
  SELECT DISTINCT
    CASE 
      WHEN cm.location_ids IS NULL OR array_length(cm.location_ids, 1) IS NULL
      THEN c.id  -- User can access all locations in the clinic
      ELSE UNNEST(cm.location_ids)  -- User can access specific locations
    END as location_id,
    c.subscription_id
  FROM public.clinic_members cm
  JOIN public.clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- Step 11: Add migration status tracking
CREATE TABLE IF NOT EXISTS public.migration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'rolled_back')),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Record this migration
INSERT INTO public.migration_status (migration_name, status, started_at, completed_at)
VALUES ('20260213_100_multi_location_phase1', 'completed', now(), now())
ON CONFLICT (migration_name) DO UPDATE SET status = 'completed', completed_at = now();
