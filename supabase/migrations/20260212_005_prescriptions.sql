-- Prescriptions and medications
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  route VARCHAR(50),
  quantity INTEGER,
  refills_remaining INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  prescriber_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_clinic_id ON prescriptions(clinic_id);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view prescriptions for patients in their clinic"
  ON prescriptions FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create prescriptions in their clinic"
  ON prescriptions FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update prescriptions in their clinic"
  ON prescriptions FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Medications reference table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  drug_type VARCHAR(100),
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_medications_clinic_id ON medications(clinic_id);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medications in their clinic"
  ON medications FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can manage medications in their clinic"
  ON medications FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update medications in their clinic"
  ON medications FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));
