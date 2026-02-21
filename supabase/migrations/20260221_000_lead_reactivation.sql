-- Lead Re-activation Module
-- Adds lead_status, last_interaction_date, lost_reason, opt_out_reactivation to patients
-- Creates reactivation_logs table for tracking automated messages
-- Timestamp: 2026-02-21

-- Extend patients table for lead lifecycle
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'active' CHECK (lead_status IN ('active', 'cold', 'lapsed', 'recovered')),
  ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lost_reason TEXT,
  ADD COLUMN IF NOT EXISTS opt_out_reactivation BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_patients_lead_status ON patients(lead_status);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_lead_status ON patients(clinic_id, lead_status);

-- Reactivation logs: tracks which automated message was sent to which patient
CREATE TABLE IF NOT EXISTS reactivation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sequence_day INTEGER NOT NULL CHECK (sequence_day IN (1, 7, 14, 30)),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, sequence_day)
);

CREATE INDEX idx_reactivation_logs_clinic_id ON reactivation_logs(clinic_id);
CREATE INDEX idx_reactivation_logs_patient_id ON reactivation_logs(patient_id);
CREATE INDEX idx_reactivation_logs_clinic_sent ON reactivation_logs(clinic_id, sent_at);

ALTER TABLE reactivation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactivation logs in their clinic"
  ON reactivation_logs FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can insert reactivation logs in their clinic"
  ON reactivation_logs FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));
