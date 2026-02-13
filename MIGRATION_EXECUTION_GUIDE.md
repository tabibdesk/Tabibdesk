# Multi-Location Architecture Migration Guide

## Overview
This migration transforms the system from single-clinic-per-subscription to multi-location support with shared patient records.

## Architecture Change
```
Before:
Subscription → Clinic (single location) → Patients → Staff

After:
Subscription → Clinic (renamed conceptually to Clinic Location) → Patients (shared at subscription level) → Staff (location-assigned)
```

## Phase 1: Add Columns (COMPLETED)
The migration adds:
- `location_ids[]` to clinic_members - allows restricting staff to specific locations
- `subscription_id` to patients - makes patients shareable across clinic locations
- `primary_doctor_id` to patients - explicitly assigns a primary doctor
- `clinic_location_id` to appointments - identifies which location the appointment is at
- Helper function `get_user_accessible_locations()` - efficiently queries staff access

## Phase 2: Update RLS Policies (IN `20260213_101_multi_location_phase2_rls.sql`)
Updates security policies to:
- Allow patients to be viewed by any staff member in their subscription (if no location restriction)
- Restrict staff view based on location_ids assignment
- Allow location-scoped appointments

## Phase 3: Update Application Code
Update repos and APIs to:
- Load patients by subscription_id instead of clinic_id
- Filter appointments by location_ids for staff
- Support location-based staff management

## Execution Steps

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Copy & execute Phase 1** from `supabase/migrations/20260213_100_multi_location_phase1.sql`
4. **Verify** - Check that columns were added:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'patients' AND column_name = 'subscription_id';
   ```
5. **Copy & execute Phase 2** from `supabase/migrations/20260213_101_multi_location_phase2_rls.sql`
6. **Verify RLS** - Check policies updated successfully
7. **Update Application Code** - See Phase 3 changes below

## Data Consistency Checks

### After Phase 1
```sql
-- All patients should have subscription_id populated
SELECT COUNT(*) as total, COUNT(subscription_id) as with_subscription_id FROM patients;
-- Should return same numbers

-- Check appointments have clinic_location_id
SELECT COUNT(*) as total, COUNT(clinic_location_id) as with_location FROM appointments;
-- Should return same numbers
```

### After Phase 2  
```sql
-- Test RLS - login as non-admin user and query
SELECT * FROM patients LIMIT 1;
-- Should only return patients in user's accessible locations
```

## Rollback Plan (if needed)

```sql
-- Remove new columns
ALTER TABLE patients DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE patients DROP COLUMN IF EXISTS primary_doctor_id;
ALTER TABLE clinic_members DROP COLUMN IF EXISTS location_ids;
ALTER TABLE clinic_members DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS clinic_location_id;

-- Drop function
DROP FUNCTION IF EXISTS get_user_accessible_locations(uuid);
```

## No Breaking Changes
- Old `clinic_id` columns kept for backward compatibility
- All new columns have defaults (NULL)
- RLS policies layered on top (don't modify existing queries, only restrict)
- Application code can be updated incrementally
