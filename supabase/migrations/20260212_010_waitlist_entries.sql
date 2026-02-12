-- Waitlist entries (patients waiting for appointments)
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  preferred_date DATE,
  priority VARCHAR(50) DEFAULT 'normal',
  reason TEXT,
  contact_preference VARCHAR(50) DEFAULT 'phone',
  status VARCHAR(50) DEFAULT 'waiting',
  position_in_queue INTEGER,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_waitlist_entries_patient_id ON waitlist_entries(patient_id);
CREATE INDEX idx_waitlist_entries_clinic_id ON waitlist_entries(clinic_id);
CREATE INDEX idx_waitlist_entries_status ON waitlist_entries(status);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view waitlist entries in their clinic"
  ON waitlist_entries FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can add patients to waitlist in their clinic"
  ON waitlist_entries FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update waitlist entries in their clinic"
  ON waitlist_entries FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));
