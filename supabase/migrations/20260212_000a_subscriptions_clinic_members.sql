-- Subscriptions (tenant / parent account)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier text NOT NULL CHECK (plan_tier IN ('solo', 'multi', 'more')),
  owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Clinics belong to one subscription
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id);

-- Clinic members: user_id + clinic_id + role (doctor | assistant | manager)
CREATE TABLE IF NOT EXISTS public.clinic_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('doctor', 'assistant', 'manager')),
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON public.clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON public.clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinics_subscription_id ON public.clinics(subscription_id);

-- RLS: users can read subscriptions they own or are members of (via clinic_members -> clinics)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read subscriptions they own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can read subscriptions for clinics they belong to"
  ON public.subscriptions FOR SELECT
  USING (
    id IN (
      SELECT c.subscription_id FROM public.clinics c
      INNER JOIN public.clinic_members cm ON cm.clinic_id = c.id
      WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own clinic memberships"
  ON public.clinic_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can read clinic_members for clinics they belong to"
  ON public.clinic_members FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid()
    )
  );

-- Optional: allow subscription owner to manage clinic_members (insert/update/delete)
-- Add further policies as needed for your auth model.
