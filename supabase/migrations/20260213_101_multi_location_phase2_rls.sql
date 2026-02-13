-- Phase 2: Update RLS policies for multi-location access control
-- Timestamp: 2026-02-13

-- Helper function: Check if user has access to a specific location
CREATE OR REPLACE FUNCTION has_location_access(p_user_id uuid, p_location_id uuid)
RETURNS boolean AS $$
DECLARE
  v_clinic_id uuid;
  v_location_ids uuid[];
BEGIN
  -- Get the clinic_id (location_id) from input
  v_clinic_id := p_location_id;
  
  -- Check if user is a member of this clinic/location
  SELECT location_ids INTO v_location_ids
  FROM public.clinic_members
  WHERE user_id = p_user_id AND clinic_id = v_clinic_id
  LIMIT 1;
  
  -- If location_ids is NULL or empty, user has access to all locations in the clinic
  -- If location_ids has values, check if the specific location is in the list
  RETURN FOUND AND (v_location_ids IS NULL OR v_clinic_id = ANY(v_location_ids));
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function: Check if user has subscription access (for org-level access)
CREATE OR REPLACE FUNCTION has_subscription_access(p_user_id uuid, p_subscription_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.clinic_members cm
    JOIN public.clinics c ON c.id = cm.clinic_id
    WHERE cm.user_id = p_user_id
    AND c.subscription_id = p_subscription_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Update patient RLS policies for multi-location/multi-subscription access

-- Drop old patient policies
DROP POLICY IF EXISTS "Users can view patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Users can update patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Users can delete patients in their clinic" ON public.patients;

-- New policies: Based on subscription + location access
CREATE POLICY "Users can view patients in their accessible organization"
  ON public.patients FOR SELECT
  USING (
    -- User can see patients in their subscription if they have access to at least one location
    EXISTS (
      SELECT 1
      FROM public.clinic_members cm
      JOIN public.clinics c ON c.id = cm.clinic_id
      WHERE cm.user_id = auth.uid()
      AND c.subscription_id = patients.subscription_id
      AND (
        -- User has access to all locations OR has access to this patient's clinic_id location
        cm.location_ids IS NULL 
        OR patients.clinic_id = ANY(cm.location_ids)
      )
    )
  );

CREATE POLICY "Users can insert patients in their subscription"
  ON public.patients FOR INSERT
  WITH CHECK (
    -- User must be a member of the subscription with location access
    has_subscription_access(auth.uid(), subscription_id)
    AND (
      -- User has access to this clinic_id location
      EXISTS (
        SELECT 1
        FROM public.clinic_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.clinic_id = patients.clinic_id
        AND (cm.location_ids IS NULL OR cm.clinic_id = ANY(cm.location_ids))
      )
    )
  );

CREATE POLICY "Users can update patients in their subscription"
  ON public.patients FOR UPDATE
  USING (
    has_subscription_access(auth.uid(), subscription_id)
    AND (
      EXISTS (
        SELECT 1
        FROM public.clinic_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.clinic_id = patients.clinic_id
        AND (cm.location_ids IS NULL OR cm.clinic_id = ANY(cm.location_ids))
      )
    )
  )
  WITH CHECK (
    has_subscription_access(auth.uid(), subscription_id)
  );

CREATE POLICY "Managers can delete patients in their subscription"
  ON public.patients FOR DELETE
  USING (
    has_subscription_access(auth.uid(), subscription_id)
    AND EXISTS (
      SELECT 1
      FROM public.clinic_members cm
      WHERE cm.user_id = auth.uid()
      AND cm.clinic_id = patients.clinic_id
      AND cm.role = 'manager'
      AND (cm.location_ids IS NULL OR cm.clinic_id = ANY(cm.location_ids))
    )
  );

-- Update appointment RLS policies
DROP POLICY IF EXISTS "Users can view appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments in their clinic" ON public.appointments;

CREATE POLICY "Users can view appointments at their accessible locations"
  ON public.appointments FOR SELECT
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can create appointments at authorized locations"
  ON public.appointments FOR INSERT
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can update appointments at authorized locations"
  ON public.appointments FOR UPDATE
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  )
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

-- Update availability_slots RLS policies
DROP POLICY IF EXISTS "Users can view availability slots in their clinic" ON public.availability_slots;
DROP POLICY IF EXISTS "Users can manage availability slots in their clinic" ON public.availability_slots;
DROP POLICY IF EXISTS "Users can update availability slots in their clinic" ON public.availability_slots;

CREATE POLICY "Users can view availability slots at authorized locations"
  ON public.availability_slots FOR SELECT
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can manage availability slots at authorized locations"
  ON public.availability_slots FOR INSERT
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can update availability slots at authorized locations"
  ON public.availability_slots FOR UPDATE
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  )
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

-- Update patient_progress RLS policies
DROP POLICY IF EXISTS "Users can view progress for patients in their clinic" ON public.patient_progress;
DROP POLICY IF EXISTS "Users can manage progress in their clinic" ON public.patient_progress;
DROP POLICY IF EXISTS "Users can update progress in their clinic" ON public.patient_progress;

CREATE POLICY "Users can view progress for accessible patients"
  ON public.patient_progress FOR SELECT
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can manage progress at authorized locations"
  ON public.patient_progress FOR INSERT
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can update progress at authorized locations"
  ON public.patient_progress FOR UPDATE
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  )
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

-- Update waitlist RLS policies
DROP POLICY IF EXISTS "Users can view waitlist for their clinic" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Users can manage waitlist in their clinic" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Users can update waitlist in their clinic" ON public.waitlist_entries;

CREATE POLICY "Users can view waitlist at authorized locations"
  ON public.waitlist_entries FOR SELECT
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can manage waitlist at authorized locations"
  ON public.waitlist_entries FOR INSERT
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

CREATE POLICY "Users can update waitlist at authorized locations"
  ON public.waitlist_entries FOR UPDATE
  USING (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  )
  WITH CHECK (
    has_location_access(auth.uid(), COALESCE(clinic_location_id, clinic_id))
  );

-- Record migration
INSERT INTO public.migration_status (migration_name, status, started_at, completed_at)
VALUES ('20260213_101_multi_location_phase2_rls', 'completed', now(), now())
ON CONFLICT (migration_name) DO UPDATE SET status = 'completed', completed_at = now();
