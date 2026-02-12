-- Tasks, diets, and patient care plans
-- Timestamp: 2026-02-12

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES clinic_memberships(id) ON DELETE SET NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  task_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_clinic_id ON tasks(clinic_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their clinic"
  ON tasks FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create tasks in their clinic"
  ON tasks FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update tasks in their clinic"
  ON tasks FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Diet plans
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  plan_type VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  calories_per_day INTEGER,
  macros_carbs DECIMAL(5,2),
  macros_protein DECIMAL(5,2),
  macros_fat DECIMAL(5,2),
  restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diet_plans_patient_id ON diet_plans(patient_id);
CREATE INDEX idx_diet_plans_clinic_id ON diet_plans(clinic_id);

ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diet plans for patients in their clinic"
  ON diet_plans FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can create diet plans in their clinic"
  ON diet_plans FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update diet plans in their clinic"
  ON diet_plans FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));

-- Exercise routines
CREATE TABLE IF NOT EXISTS exercise_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(100),
  intensity VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_routines_patient_id ON exercise_routines(patient_id);
CREATE INDEX idx_exercise_routines_clinic_id ON exercise_routines(clinic_id);

ALTER TABLE exercise_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercise routines for patients in their clinic"
  ON exercise_routines FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Users can manage exercise routines in their clinic"
  ON exercise_routines FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

CREATE POLICY "Users can update exercise routines in their clinic"
  ON exercise_routines FOR UPDATE
  USING (is_clinic_member(clinic_id))
  WITH CHECK (is_clinic_member(clinic_id));
