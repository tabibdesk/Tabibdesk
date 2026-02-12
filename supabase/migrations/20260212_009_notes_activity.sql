-- Notes, attachments, and activity logs
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES clinic_memberships(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  note_type VARCHAR(50),
  visibility VARCHAR(50) DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_patient_id ON notes(patient_id);
CREATE INDEX idx_notes_clinic_id ON notes(clinic_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes for patients in their clinic"
  ON notes FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create notes in their clinic"
  ON notes FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update notes in their clinic"
  ON notes FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Attachments (for storing references to files in storage)
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  storage_path VARCHAR(500) NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_clinic_id ON attachments(clinic_id);
CREATE INDEX idx_attachments_patient_id ON attachments(patient_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their clinic"
  ON attachments FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can upload attachments in their clinic"
  ON attachments FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can delete attachments in their clinic"
  ON attachments FOR DELETE
  USING (is_clinic_member(clinic_id));

-- Activity log
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES clinic_memberships(id) ON DELETE CASCADE,
  entity_type VARCHAR(100),
  entity_id UUID,
  action VARCHAR(50),
  changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_clinic_id ON activity_logs(clinic_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs in their clinic"
  ON activity_logs FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (TRUE);
