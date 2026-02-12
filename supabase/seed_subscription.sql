-- Seed one subscription and make the given user owner + manager of all clinics.
-- Run this in Supabase SQL Editor after replacing YOUR_AUTH_USER_UUID.
--
-- 1. Get the UUID from: Supabase Dashboard → Authentication → Users
-- 2. Replace YOUR_AUTH_USER_UUID below with that UUID (keep the quotes).

DO $$
DECLARE
  owner_uuid uuid := 'YOUR_AUTH_USER_UUID';
  sub_id uuid;
  clinic_row record;
BEGIN
  INSERT INTO public.subscriptions (id, plan_tier, owner_id, status, name)
  VALUES (gen_random_uuid(), 'multi', owner_uuid, 'active', 'My Practice')
  RETURNING id INTO sub_id;

  UPDATE public.clinics
  SET subscription_id = sub_id
  WHERE subscription_id IS NULL;

  FOR clinic_row IN
    SELECT id FROM public.clinics WHERE subscription_id = sub_id
  LOOP
    INSERT INTO public.clinic_members (user_id, clinic_id, role)
    VALUES (owner_uuid, clinic_row.id, 'manager')
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
  END LOOP;
END $$;
