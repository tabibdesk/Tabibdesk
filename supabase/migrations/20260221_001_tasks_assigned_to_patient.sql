-- Allow tasks to be assigned to patients as well as staff
-- Timestamp: 2026-02-21

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assigned_to_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_patient_id ON tasks(assigned_to_patient_id);
