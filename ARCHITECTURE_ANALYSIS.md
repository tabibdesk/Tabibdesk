# Implementation Analysis: Multi-Doctor, Multi-Clinic Architecture

## Current Implementation Status

### ✅ IMPLEMENTED

**1. Multi-Doctor Support**
- Clinic members can have the role "doctor" (stored in `clinic_members.role`)
- Multiple doctors can be part of the same clinic
- Appointments can be assigned to specific doctors
- Doctor availability tracking is supported

**2. Multi-Clinic (with caveats)**
- `clinics` table stores clinic data with name, address, phone, email
- Each clinic is linked to a `subscription` (billing entity)
- One subscription can theoretically have multiple clinics (via `clinics.subscription_id`)
- Users can be members of multiple clinics (via `clinic_members` join table)

**3. Staff Roles**
- Three roles implemented: `doctor`, `assistant`, `manager`
- Stored in `clinic_members.role` column
- Managers can invite staff by adding their emails to allowed list (UI feature - not DB-enforced)
- Role-based access control via RLS policies

**4. Patients**
- Patients table has `clinic_id` - patients belong to ONE clinic only
- Patients are NOT shared across clinics
- Each patient has `doctor_id` reference (implied - stored in appointments/records)
- `patient_progress` table tracks patient health metrics

**5. Registration & Auto-Clinic Creation**
- Signup trigger (`handle_new_user_signup()`) auto-creates clinic with subscription
- New user becomes "manager" of their clinic
- Clinic name comes from signup metadata
- Subscription is created with `plan_tier: 'solo'` by default

### ❌ NOT IMPLEMENTED

**1. Clinic Branches/Locations**
- NO `clinic_locations` or `clinic_branches` table exists
- No way to specify which doctor works at which location
- No location-specific patient assignments
- No location-based access control

**2. Location-Based Access**
- Managers cannot restrict staff access to specific branches/locations
- No mechanism to grant doctor access to "all locations" or "specific locations"
- All clinic members see all clinic data (based on clinic membership alone)

**3. Patient Sharing Across Locations**
- Patients are locked to `clinic_id` - not shared across multiple clinic locations
- Each location would need to create separate patient records
- No way to link patient records across locations within same organization

**4. Primary Doctor Assignment (Formally)**
- Doctor assignment exists in appointments but not as a patient-level attribute
- No explicit `patients.primary_doctor_id` column
- Primary doctor is inferred from appointment records, not explicitly stored

### 🔧 PARTIAL/MIXED

**1. Multi-Subscription Management**
- Code exists for checking `plan_tier IN ('solo', 'multi', 'more')`
- Backend logic not fully implemented to differentiate tiers
- No enforcement of multi-clinic limits based on tier

**2. Clinic Member Permissions**
- RLS policies are basic: users can see all clinic data if they're a clinic member
- No role-based read/write restrictions in RLS
- No location-based filtering in RLS

## Database Schema Summary

```
subscriptions (owner_id, plan_tier, status)
    ↓
clinics (subscription_id, name, address, phone, email)
    ↓
clinic_members (user_id, clinic_id, role) [doctor|assistant|manager]
    ↓
patients (clinic_id, first_name, last_name, email, phone, ...)
appointments (patient_id, doctor_id, clinic_id, time, status)
```

## What's Missing for Your Described Architecture

### To Support Clinic Branches/Locations:

1. **New Table: `clinic_locations`**
   ```sql
   clinic_locations (
     id, clinic_id, name, address, phone, email, created_at
   )
   ```

2. **Updated `clinic_members` to include location access**
   ```sql
   clinic_members ADD COLUMN location_ids UUID[] -- array of location IDs or NULL (all locations)
   ```

3. **Link patients to location**
   ```sql
   patients ADD COLUMN clinic_location_id UUID -- which location patient visits
   ```

4. **Location-based RLS policies**
   - Check both clinic membership AND location access
   - Filter patients by location when needed

### To Support Patient Sharing Across Locations:

1. **Clinic-level vs. Location-level** patient records
2. **Primary patient record** at clinic level
3. **Location-specific visit history** in separate table
4. **Cross-location patient queries** would need to aggregate

### To Support Primary Doctor Assignment:

```sql
patients ADD COLUMN primary_doctor_id UUID REFERENCES clinic_members(id)
```

## Recommendations

**Short-term (MVP):**
- Keep current structure - one clinic = one location
- Mark this as "single location clinic" feature

**Medium-term:**
- Add `clinic_locations` table for branch support
- Update RLS to filter by location
- Add location restrictions in `clinic_members`

**Long-term:**
- Implement cross-location patient records
- Add advanced reporting across locations
- Support location-specific billing

## Current Limitations for Your Use Case

1. ❌ Cannot create clinic branches/locations in a single organization
2. ❌ Cannot restrict staff to specific branches
3. ❌ Cannot have shared patient records across branch locations
4. ✅ CAN have multiple clinics under one subscription (but no UI for it)
5. ✅ CAN assign doctors/assistants to a clinic with roles
6. ✅ CAN manage patient data within a clinic
