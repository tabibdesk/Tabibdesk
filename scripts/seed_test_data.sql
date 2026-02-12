-- Seed test data for clinic management system
-- Run this migration to populate the database with realistic test data

-- Disable RLS temporarily for seeding (will be re-enabled automatically)
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_approvals DISABLE ROW LEVEL SECURITY;

-- Create a test user UUID (in production, these would be real auth users)
-- For testing, we'll use a static UUID
INSERT INTO public.subscriptions (id, owner_id, plan_tier, status, name)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'multi',
  'active',
  'Demo Clinic Network'
) ON CONFLICT DO NOTHING;

INSERT INTO public.clinics (id, name, email, phone, address, subscription_id)
VALUES
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Central Medical Clinic',
    'info@centralmedical.com',
    '+1-555-0100',
    '123 Health Street, Medical City, MC 12345',
    '11111111-1111-1111-1111-111111111111'::uuid
  ),
  (
    '22222222-2222-2222-2222-222222222223'::uuid,
    'Wellness Center',
    'contact@wellnesscenter.com',
    '+1-555-0101',
    '456 Wellness Ave, Health Town, HT 67890',
    '11111111-1111-1111-1111-111111111111'::uuid
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.clinic_members (user_id, clinic_id, role)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'admin'),
  ('00000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222223'::uuid, 'doctor'),
  ('00000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'doctor'),
  ('00000000-0000-0000-0000-000000000003'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'assistant')
ON CONFLICT DO NOTHING;

INSERT INTO public.patients (
  clinic_id, first_name, last_name, email, phone, date_of_birth, gender, 
  address, city, state, postal_code, country, blood_type, allergies, medical_history
)
VALUES
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'John', 'Smith', 'john.smith@email.com', '+1-555-1001', '1985-03-15', 'M',
    '100 Oak Lane', 'Medical City', 'MC', '12345', 'USA', 'O+', 'Penicillin',
    'Hypertension, Type 2 Diabetes'
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Sarah', 'Johnson', 'sarah.j@email.com', '+1-555-1002', '1992-07-22', 'F',
    '200 Maple Dr', 'Medical City', 'MC', '12345', 'USA', 'A-', 'Shellfish',
    'Asthma, Seasonal Allergies'
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Michael', 'Williams', 'michael.w@email.com', '+1-555-1003', '1978-11-08', 'M',
    '300 Pine St', 'Medical City', 'MC', '12345', 'USA', 'B+', 'None',
    'Previous appendectomy'
  ),
  (
    '22222222-2222-2222-2222-222222222223'::uuid,
    'Emily', 'Davis', 'emily.d@email.com', '+1-555-1004', '1995-05-30', 'F',
    '400 Elm Ave', 'Health Town', 'HT', '67890', 'USA', 'AB+', 'Latex',
    'None'
  ),
  (
    '22222222-2222-2222-2222-222222222223'::uuid,
    'James', 'Brown', 'james.b@email.com', '+1-555-1005', '1988-09-12', 'M',
    '500 Birch Rd', 'Health Town', 'HT', '67890', 'USA', 'O-', 'None',
    'Migraine headaches'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.patient_progress (patient_id, clinic_id, weight, height, bmi, notes)
SELECT
  p.id,
  p.clinic_id,
  75 + (random() * 30)::numeric(6,2),
  170 + (random() * 20)::numeric(6,2),
  ((75 + (random() * 30)) / ((170 + (random() * 20)) / 100)^2)::numeric(5,2),
  'Regular checkup and monitoring'
FROM public.patients p
WHERE p.clinic_id IN ('22222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222223'::uuid)
ON CONFLICT DO NOTHING;

INSERT INTO public.medications (clinic_id, name, description)
VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Metformin', 'Oral antidiabetic medication'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Lisinopril', 'ACE inhibitor for hypertension'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Aspirin', 'Pain reliever and anticoagulant'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'Albuterol', 'Bronchodilator for asthma'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'Cetirizine', 'Antihistamine for allergies')
ON CONFLICT DO NOTHING;

INSERT INTO public.diagnoses (patient_id, clinic_id, diagnosis_code, diagnosis_name, date_diagnosed, status)
SELECT
  p.id,
  p.clinic_id,
  'E11',
  'Type 2 Diabetes Mellitus',
  NOW() - INTERVAL '1 year',
  'active'
FROM public.patients p
WHERE p.first_name = 'John' AND p.last_name = 'Smith'
UNION ALL
SELECT
  p.id,
  p.clinic_id,
  'I10',
  'Essential Hypertension',
  NOW() - INTERVAL '2 years',
  'active'
FROM public.patients p
WHERE p.first_name = 'John' AND p.last_name = 'Smith'
UNION ALL
SELECT
  p.id,
  p.clinic_id,
  'J45.9',
  'Asthma, Unspecified',
  NOW() - INTERVAL '5 years',
  'active'
FROM public.patients p
WHERE p.first_name = 'Sarah' AND p.last_name = 'Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.vendors (clinic_id, name, email, phone, address)
VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Medical Supply Co', 'sales@medsupply.com', '+1-555-2001', '999 Supply Blvd'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Laboratory Services Inc', 'orders@labservices.com', '+1-555-2002', '888 Lab Street'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'Pharmaceutical Distributors', 'info@pharmdist.com', '+1-555-2003', '777 Pharma Lane')
ON CONFLICT DO NOTHING;

INSERT INTO public.invoices (clinic_id, patient_id, invoice_number, amount, status, due_date)
SELECT
  p.clinic_id,
  p.id,
  'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY p.id)::text, 4, '0'),
  (100 + (random() * 900))::numeric(10,2),
  CASE WHEN random() > 0.5 THEN 'paid' ELSE 'pending' END,
  NOW() + INTERVAL '30 days'
FROM public.patients p
WHERE p.clinic_id = '22222222-2222-2222-2222-222222222222'::uuid
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (patient_id, clinic_id, title, description, status, due_date)
SELECT
  p.id,
  p.clinic_id,
  'Follow-up appointment',
  'Schedule follow-up appointment for ' || p.first_name,
  CASE WHEN random() > 0.6 THEN 'completed' ELSE 'pending' END,
  NOW() + INTERVAL '7 days'
FROM public.patients p
WHERE p.clinic_id = '22222222-2222-2222-2222-222222222222'::uuid
ON CONFLICT DO NOTHING;

INSERT INTO public.settings (clinic_id, key, value)
VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 'business_hours_start', '09:00'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'business_hours_end', '17:00'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'appointment_duration', '30'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'business_hours_start', '08:00'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'business_hours_end', '18:00'),
  ('22222222-2222-2222-2222-222222222223'::uuid, 'appointment_duration', '45')
ON CONFLICT DO NOTHING;

-- Re-enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_approvals ENABLE ROW LEVEL SECURITY;
