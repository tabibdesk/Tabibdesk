-- Medical records, diagnoses, and conditions
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_clinic_id ON medical_records(clinic_id);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medical records for patients in their clinic"
  ON medical_records FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create medical records in their clinic"
  ON medical_records FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update medical records in their clinic"
  ON medical_records FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  icd_code VARCHAR(50),
  diagnosis_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  onset_date DATE,
  resolved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_clinic_id ON diagnoses(clinic_id);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diagnoses for patients in their clinic"
  ON diagnoses FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can manage diagnoses in their clinic"
  ON diagnoses FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update diagnoses in their clinic"
  ON diagnoses FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  condition_name VARCHAR(255) NOT NULL,
  severity VARCHAR(50),
  onset_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_medical_conditions_patient_id ON medical_conditions(patient_id);
CREATE INDEX idx_medical_conditions_clinic_id ON medical_conditions(clinic_id);

ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conditions for patients in their clinic"
  ON medical_conditions FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can manage conditions in their clinic"
  ON medical_conditions FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update conditions in their clinic"
  ON medical_conditions FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));
