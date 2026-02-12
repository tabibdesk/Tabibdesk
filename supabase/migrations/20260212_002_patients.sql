-- Patients table and related structures
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  blood_type VARCHAR(10),
  allergies TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_email ON patients(email);

-- RLS Policies for patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patients in their clinic"
  ON patients FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can insert patients in their clinic"
  ON patients FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update patients in their clinic"
  ON patients FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can delete patients in their clinic"
  ON patients FOR DELETE
  USING (is_clinic_member(clinic_id) AND has_clinic_role(clinic_id, 'admin'));

-- Progress tracking table
CREATE TABLE IF NOT EXISTS patient_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  weight DECIMAL(6,2),
  height DECIMAL(6,2),
  bmi DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patient_progress_patient_id ON patient_progress(patient_id);
CREATE INDEX idx_patient_progress_clinic_id ON patient_progress(clinic_id);

ALTER TABLE patient_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view progress for patients in their clinic"
  ON patient_progress FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can manage progress in their clinic"
  ON patient_progress FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update progress in their clinic"
  ON patient_progress FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));
