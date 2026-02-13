-- Row-Level Security Policies
-- Timestamp: 2026-02-13
-- Ensures users can only access data from clinics they belong to

-- Enable RLS on all relevant tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's clinic IDs
CREATE OR REPLACE FUNCTION public.get_user_clinic_ids()
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY
  SELECT clinic_id
  FROM public.clinic_members
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CLINICS: Users can view clinics they're members of
CREATE POLICY "Users can view their clinics"
  ON public.clinics FOR SELECT
  USING (id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update their clinics"
  ON public.clinics FOR UPDATE
  USING (id IN (SELECT public.get_user_clinic_ids()));

-- CLINIC_MEMBERS: Users can view members of their clinics
CREATE POLICY "Users can view clinic members"
  ON public.clinic_members FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Managers can insert clinic members"
  ON public.clinic_members FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Managers can delete clinic members"
  ON public.clinic_members FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- SUBSCRIPTIONS: Users can view subscriptions for their clinics
CREATE POLICY "Users can view their subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT subscription_id FROM public.clinics
      WHERE id IN (SELECT public.get_user_clinic_ids())
    )
  );

CREATE POLICY "Owners can update their subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (owner_id = auth.uid());

-- PATIENTS: Users can access patients from their clinics
CREATE POLICY "Users can view clinic patients"
  ON public.patients FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can insert clinic patients"
  ON public.patients FOR INSERT
  WITH CHECK (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update clinic patients"
  ON public.patients FOR UPDATE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Managers can delete clinic patients"
  ON public.patients FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- APPOINTMENTS: Users can access appointments from their clinics
CREATE POLICY "Users can view clinic appointments"
  ON public.appointments FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can insert clinic appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update clinic appointments"
  ON public.appointments FOR UPDATE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can delete clinic appointments"
  ON public.appointments FOR DELETE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

-- MEDICAL_RECORDS: Users can access medical records from their clinics
CREATE POLICY "Users can view clinic medical records"
  ON public.medical_records FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

CREATE POLICY "Users can insert clinic medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

CREATE POLICY "Users can update clinic medical records"
  ON public.medical_records FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

-- PRESCRIPTIONS: Users can access prescriptions from their clinics
CREATE POLICY "Users can view clinic prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

CREATE POLICY "Users can insert clinic prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

CREATE POLICY "Users can update clinic prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE clinic_id IN (SELECT public.get_user_clinic_ids())
    )
  );

-- PAYMENTS: Users can access payments from their clinics
CREATE POLICY "Users can view clinic payments"
  ON public.payments FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can insert clinic payments"
  ON public.payments FOR INSERT
  WITH CHECK (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update clinic payments"
  ON public.payments FOR UPDATE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

-- AVAILABILITY_SLOTS: Users can access availability from their clinics
CREATE POLICY "Users can view clinic availability"
  ON public.availability_slots FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can insert clinic availability"
  ON public.availability_slots FOR INSERT
  WITH CHECK (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update clinic availability"
  ON public.availability_slots FOR UPDATE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can delete clinic availability"
  ON public.availability_slots FOR DELETE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

-- WAITLIST_ENTRIES: Users can access waitlist from their clinics
CREATE POLICY "Users can view clinic waitlist"
  ON public.waitlist_entries FOR SELECT
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can insert clinic waitlist"
  ON public.waitlist_entries FOR INSERT
  WITH CHECK (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can update clinic waitlist"
  ON public.waitlist_entries FOR UPDATE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));

CREATE POLICY "Users can delete clinic waitlist"
  ON public.waitlist_entries FOR DELETE
  USING (clinic_id IN (SELECT public.get_user_clinic_ids()));
