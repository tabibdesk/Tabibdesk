# Multi-Location Architecture Migration Plan

## Current State
- `clinics` table = single location entity
- `patients.clinic_id` = patients tied to one clinic
- `clinic_members` = staff assigned to specific clinics
- `subscriptions` = billing/organization parent

## Target State
- Rename `clinics` → `clinic_locations` (branches within organization)
- `patients.clinic_id` → `patients.subscription_id` (shared across organization)
- `clinic_members` → add `location_ids` JSON array for branch-based access
- All appointments link to `clinic_location_id`

## Migration Strategy (Backward Compatible)

### Phase 1: Add New Columns
1. Add `subscription_id` to `patients` (nullable initially)
2. Add `location_ids` to `clinic_members` (array, defaults to all locations)
3. Create `clinic_locations` view/alias for backward compatibility

### Phase 2: Data Migration
1. Migrate existing `patients.clinic_id` → `patients.subscription_id`
2. Set `clinic_members.location_ids` to all locations by default
3. Update all foreign keys

### Phase 3: Update RLS Policies
1. Update patient access based on subscription_id + location
2. Update appointment access based on location assignment
3. Update staff visibility

### Phase 4: Rename Clinics Table
1. Create migration to rename `clinics` → `clinic_locations`
2. Update all foreign key references

## Tables to Modify
1. `clinics` → rename to `clinic_locations`
2. `patients` - add `subscription_id`, keep `clinic_id` temporarily for compatibility
3. `clinic_members` - add `location_ids` (array of location IDs)
4. `appointments` - already has `clinic_id`, rename to `location_id`
5. `availability_slots` - rename `clinic_id` to `location_id`
6. `patient_progress` - rename `clinic_id` to `location_id`
7. All other tables with `clinic_id` → `location_id`

## RLS Policy Changes
- Patients visible to staff assigned to their organization + authorized locations
- Appointments visible to staff assigned to that location
- Availability slots visible to staff assigned to that location

## Risk Mitigation
- Add new columns first (backward compatible)
- Keep old column names temporarily
- Migrate data in stages
- Test after each phase
- Gradual cutover to new schema
