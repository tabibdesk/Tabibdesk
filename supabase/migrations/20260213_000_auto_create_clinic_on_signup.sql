-- Auto-create clinic and subscription on user signup
-- Timestamp: 2026-02-13

-- Function to create a clinic with owner when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  new_subscription_id uuid;
  new_clinic_id uuid;
  clinic_name_value text;
BEGIN
  -- Extract clinic_name from user metadata (set during signup)
  clinic_name_value := COALESCE(
    NEW.raw_user_meta_data->>'clinic_name',
    NEW.raw_user_meta_data->>'full_name' || '''s Clinic',
    'My Clinic'
  );

  -- Create a subscription for this user (owner)
  INSERT INTO public.subscriptions (owner_id, plan_tier, name, status)
  VALUES (NEW.id, 'solo', clinic_name_value, 'trial')
  RETURNING id INTO new_subscription_id;

  -- Create the clinic linked to this subscription
  INSERT INTO public.clinics (name, subscription_id, email)
  VALUES (
    clinic_name_value,
    new_subscription_id,
    NEW.email
  )
  RETURNING id INTO new_clinic_id;

  -- Add user as a manager (owner) of the clinic
  INSERT INTO public.clinic_members (user_id, clinic_id, role)
  VALUES (NEW.id, new_clinic_id, 'manager');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to auto-create clinic when user confirms email
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL OR NEW.phone_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Also handle when email is confirmed later (if signup doesn't immediately confirm)
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  existing_clinic_count int;
BEGIN
  -- Only run if email was just confirmed and user doesn't already have a clinic
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
    SELECT COUNT(*) INTO existing_clinic_count
    FROM public.clinic_members
    WHERE user_id = NEW.id;
    
    IF existing_clinic_count = 0 THEN
      PERFORM public.handle_new_user_signup_logic(NEW);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function that can be called from trigger or manually
CREATE OR REPLACE FUNCTION public.handle_new_user_signup_logic(user_record auth.users)
RETURNS void AS $$
DECLARE
  new_subscription_id uuid;
  new_clinic_id uuid;
  clinic_name_value text;
BEGIN
  clinic_name_value := COALESCE(
    user_record.raw_user_meta_data->>'clinic_name',
    user_record.raw_user_meta_data->>'full_name' || '''s Clinic',
    'My Clinic'
  );

  INSERT INTO public.subscriptions (owner_id, plan_tier, name, status)
  VALUES (user_record.id, 'solo', clinic_name_value, 'trial')
  RETURNING id INTO new_subscription_id;

  INSERT INTO public.clinics (name, subscription_id, email)
  VALUES (clinic_name_value, new_subscription_id, user_record.email)
  RETURNING id INTO new_clinic_id;

  INSERT INTO public.clinic_members (user_id, clinic_id, role)
  VALUES (user_record.id, new_clinic_id, 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_confirmation();
