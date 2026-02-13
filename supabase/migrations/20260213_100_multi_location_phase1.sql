-- Phase 1: Add new columns for multi-location architecture
-- This maintains backward compatibility while adding support for shared patient records
-- Timestamp: 2026-02-13

-- Step 1: Add location_ids to clinic_members (for location-based access control)
ALTER TABLE public.clinic_members
ADD COLUMN IF NOT EXISTS location_ids uuid[] DEFAULT NULL;

-- Step 2: Add subscription_id to patients (for organization-level patient sharing)
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
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS clinic_location_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Initially set clinic_location_id to match clinic_id
UPDATE public.appointments
SET clinic_location_id = clinic_id
WHERE clinic_location_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_location_id ON public.appointments(clinic_location_id);

-- Step 7: Add organization-level subscription context to clinic_members for faster access
ALTER TABLE public.clinic_members
ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE;

-- Populate subscription_id in clinic_members from the clinic's subscription
UPDATE public.clinic_members cm
SET subscription_id = c.subscription_id
FROM public.clinics c
WHERE cm.clinic_id = c.id AND cm.subscription_id IS NULL;

-- Step 8: Create function to get user's accessible locations
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
