# Supabase schema for TabibDesk

This document describes the database schema expected by the app when using Supabase. Apply these changes in the Supabase SQL editor if your project was created with the minimal schema.

## Patients table – extended columns

Add these columns to `public.patients` if they do not exist:

```sql
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS age int,
  ADD COLUMN IF NOT EXISTS height int,
  ADD COLUMN IF NOT EXISTS complaint text,
  ADD COLUMN IF NOT EXISTS job text,
  ADD COLUMN IF NOT EXISTS social_status text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_other text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS first_visit_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_visit_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_cold boolean DEFAULT false;
```

## Appointments table – extended columns

Add these columns to `public.appointments` if they do not exist:

```sql
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS doctor_id uuid,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS patient_name text;
```

Ensure `updated_at` is updated on row change:

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

## Row Level Security (RLS)

Enable RLS and add policies so that rows are scoped by `clinic_id` (and optionally `auth.uid()`). Example for patients:

```sql
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own clinic patients"
  ON public.patients FOR SELECT
  USING (true);  -- Restrict to clinic_id in app or via JWT claim

CREATE POLICY "Users can insert patients for their clinic"
  ON public.patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own clinic patients"
  ON public.patients FOR UPDATE
  USING (true);

CREATE POLICY "Users can soft-delete own clinic patients"
  ON public.patients FOR UPDATE
  USING (true);
```

Adjust policies to match your auth model (e.g. filter by `auth.uid()` or a `clinic_id` claim).

## Subscriptions and clinic members

The app expects a subscription (tenant) model and user–clinic membership. Use the migration in `supabase/migrations/20250212000000_subscriptions_and_clinic_members.sql`, or apply equivalent SQL:

- **subscriptions**: `id`, `plan_tier` (solo | multi | more), `owner_id` (auth user), `status`, `name`, `created_at`, `updated_at`
- **clinics**: add `subscription_id` FK to `subscriptions`
- **clinic_members**: `user_id`, `clinic_id`, `role` (doctor | assistant | manager), `invited_by`, with unique (user_id, clinic_id)

RLS on `subscriptions` and `clinic_members` restricts reads to the current user (owner or member of a clinic in that subscription). See the migration file for full SQL and policies.

## TypeScript types

The app’s types are in `src/lib/supabase/types.ts`. They match the schema above. Regenerate from Supabase if you use the Supabase CLI:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.generated.ts
```

Then align `src/lib/supabase/types.ts` with the generated file or replace it.
