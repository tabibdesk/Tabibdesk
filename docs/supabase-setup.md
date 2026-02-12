# Supabase backend setup

Follow these steps to use TabibDesk with a real Supabase backend instead of mock/demo data.

## Prerequisites

- A Supabase project ([supabase.com](https://supabase.com))
- Base schema already applied (e.g. `clinics`, `patients`, `appointments`, `visits` as in [supabase-schema.md](./supabase-schema.md))

---

## Step 1: Environment variables

Set these in your app (e.g. `.env.local` or Netlify env):

- `NEXT_PUBLIC_SUPABASE_URL` — your project URL (e.g. `https://xxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your project anon/public key

Get both from Supabase Dashboard → Project Settings → API.

---

## Step 2: Run migrations

Apply the subscription and clinic-members schema.

**Option A – Supabase CLI**

```bash
npx supabase db push
```

(or link the project first with `npx supabase link --project-ref YOUR_REF`)

**Option B – SQL Editor**

1. Open Supabase Dashboard → SQL Editor.
2. Run the contents of:
   - `supabase/migrations/20250212000000_subscriptions_and_clinic_members.sql`

This creates:

- `public.subscriptions`
- `public.clinic_members`
- `subscription_id` on `public.clinics`
- RLS policies

---

## Step 3: Seed subscription and membership (first user)

After the first user signs up (or if you already have a user), create one subscription and link clinics so that user can see them.

1. In Supabase Dashboard → **Authentication** → **Users**, copy the **UUID** of the user who will own the subscription (e.g. the first doctor/manager).
2. Open **SQL Editor** and run the seed script below, **replacing `YOUR_AUTH_USER_UUID`** with that UUID.

```sql
-- Replace YOUR_AUTH_USER_UUID with the UUID from Authentication → Users
DO $$
DECLARE
  owner_uuid uuid := 'YOUR_AUTH_USER_UUID';
  sub_id uuid;
  clinic_row record;
BEGIN
  -- Create one subscription for this owner
  INSERT INTO public.subscriptions (id, plan_tier, owner_id, status, name)
  VALUES (gen_random_uuid(), 'multi', owner_uuid, 'active', 'My Practice')
  RETURNING id INTO sub_id;

  -- Link all existing clinics to this subscription (if they have no subscription yet)
  UPDATE public.clinics
  SET subscription_id = sub_id
  WHERE subscription_id IS NULL;

  -- Make the owner a manager of every clinic in this subscription
  FOR clinic_row IN
    SELECT id FROM public.clinics WHERE subscription_id = sub_id
  LOOP
    INSERT INTO public.clinic_members (user_id, clinic_id, role)
    VALUES (owner_uuid, clinic_row.id, 'manager')
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
  END LOOP;
END $$;
```

If you have **no clinics** yet, create at least one, then run the same block again, or insert a clinic and then run only the `INSERT INTO clinic_members` part for that clinic.

---

## Step 4: Turn off demo mode

1. In the app, open **Settings** (or wherever demo mode is toggled).
2. **Disable demo mode** so the app uses `getBackendType() === "supabase"` and loads data from Supabase.

The app will then:

- Use Supabase Auth for the current user
- Load clinics from `clinic_members` (only clinics you’re a member of)
- Load plan tier from the clinic’s subscription
- Use Supabase for patients, appointments, and the rest of the data

---

## Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Migration `20250212000000_subscriptions_and_clinic_members.sql` applied
- [ ] Seed script run with your auth user UUID (subscription + clinic_members)
- [ ] At least one clinic exists and is linked to that subscription
- [ ] Demo mode turned off in the app

---

## Adding more users to a clinic

To let another user (e.g. a doctor or assistant) see a clinic:

1. They must have an account (Supabase Auth).
2. Insert a row in `public.clinic_members`:

```sql
INSERT INTO public.clinic_members (user_id, clinic_id, role)
VALUES ('their-auth-uuid', 'clinic-uuid', 'doctor')
ON CONFLICT (user_id, clinic_id) DO NOTHING;
```

Use role `doctor`, `assistant`, or `manager` as needed.
