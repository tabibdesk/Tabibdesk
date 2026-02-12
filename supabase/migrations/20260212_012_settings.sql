-- Clinic settings and configuration
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_duration_minutes INTEGER DEFAULT 30,
  appointment_buffer_minutes INTEGER DEFAULT 15,
  max_patients_per_day INTEGER DEFAULT 20,
  allow_online_booking BOOLEAN DEFAULT TRUE,
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '17:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1001,
  enable_prescription_module BOOLEAN DEFAULT TRUE,
  enable_accounting_module BOOLEAN DEFAULT TRUE,
  enable_waitlist BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clinic_settings_clinic_id ON clinic_settings(clinic_id);

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic settings"
  ON clinic_settings FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Admin can update clinic settings"
  ON clinic_settings FOR UPDATE
  USING (has_clinic_role(clinic_id, 'admin'))
  WITH CHECK (has_clinic_role(clinic_id, 'admin'));
