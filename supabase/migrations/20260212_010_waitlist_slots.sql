-- Appointment slots availability (daily slots for doctors)
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES clinic_memberships(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_slots_clinic_id ON appointment_slots(clinic_id);
CREATE INDEX idx_appointment_slots_doctor_id ON appointment_slots(doctor_id);
CREATE INDEX idx_appointment_slots_date ON appointment_slots(slot_date);

ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointment slots in their clinic"
  ON appointment_slots FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create appointment slots in their clinic"
  ON appointment_slots FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update appointment slots in their clinic"
  ON appointment_slots FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Waitlist approvals (for admin to manage waitlist approvals)
CREATE TABLE IF NOT EXISTS waitlist_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_entry_id UUID NOT NULL REFERENCES waitlist_entries(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES clinic_memberships(id) ON DELETE RESTRICT,
  approval_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_waitlist_approvals_waitlist_entry_id ON waitlist_approvals(waitlist_entry_id);
CREATE INDEX idx_waitlist_approvals_clinic_id ON waitlist_approvals(clinic_id);

ALTER TABLE waitlist_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view waitlist approvals in their clinic"
  ON waitlist_approvals FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create waitlist approvals in their clinic"
  ON waitlist_approvals FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

-- Archive table for soft-deletes
CREATE TABLE IF NOT EXISTS archived_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  original_data JSONB NOT NULL,
  archived_by UUID NOT NULL REFERENCES clinic_memberships(id) ON DELETE RESTRICT,
  archive_reason VARCHAR(255),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_archived_records_clinic_id ON archived_records(clinic_id);
CREATE INDEX idx_archived_records_entity ON archived_records(entity_type, entity_id);

ALTER TABLE archived_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view archived records in their clinic"
  ON archived_records FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can archive records in their clinic"
  ON archived_records FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));
