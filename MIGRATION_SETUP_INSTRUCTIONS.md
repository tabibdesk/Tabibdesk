# Supabase Database Migration Setup Instructions

The database migrations are now in the correct order. Execute them in the Supabase SQL Editor in this exact sequence:

## Migration Execution Order

1. **20260212_000_clinics.sql** - Base clinics table (must run first)
2. **20250212000000_subscriptions_and_clinic_members.sql** - Subscriptions & clinic members
3. **20260212_001_helpers.sql** - Helper functions (required by RLS policies)
4. **20260212_002_patients.sql** - Patients table
5. **20260212_003_medical_records.sql** - Medical records & diagnoses
6. **20260212_004_appointments.sql** - Appointments & availability
7. **20260212_005_prescriptions.sql** - Prescriptions & medications
8. **20260212_006_tasks_diets.sql** - Tasks & diet plans
9. **20260212_007_invoices_payments.sql** - Invoices & payments
10. **20260212_008_expenses_vendors.sql** - Expenses & vendors
11. **20260212_009_notes_activity.sql** - Notes & activity logs
12. **20260212_010_waitlist_entries.sql** - Waitlist entries
13. **20260212_011_waitlist_slots.sql** - Waitlist slots & approvals
14. **20260212_012_settings.sql** - Clinic settings
15. **20260212_013_updated_at_trigger.sql** - Auto-update triggers

## How to Execute

### Option A: Execute One-by-One (Recommended for Testing)
1. Go to your Supabase Project Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `20260212_000_clinics.sql`
5. Click **Run**
6. Repeat steps 3-5 for each migration file in order

### Option B: Execute All at Once
1. Create a new file by concatenating all migration files in order
2. Copy all content to Supabase SQL Editor
3. Click **Run**

## Verification

After all migrations execute successfully, verify in your Supabase Dashboard:
- **Tables** section should show 20+ tables
- **Functions** section should show `is_clinic_member`, `user_clinic_role`, `has_clinic_role`, and `update_updated_at_column`
- **Triggers** section should show triggers for all tables with `updated_at` columns

## Troubleshooting

If you get an error like "relation X does not exist":
- The migrations must run in the exact order specified above
- Each migration depends on previous ones being executed first
- Go back through and ensure all previous migrations ran without errors
