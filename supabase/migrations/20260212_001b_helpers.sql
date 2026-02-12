-- Helpers and utility functions for RLS policies
-- Timestamp: 2026-02-12

-- Helper function to check if user is a member of clinic
CREATE OR REPLACE FUNCTION is_clinic_member(clinic_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clinic_members
    WHERE clinic_members.clinic_id = $1
      AND clinic_members.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user role within clinic
CREATE OR REPLACE FUNCTION user_clinic_role(clinic_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM clinic_members
     WHERE clinic_members.clinic_id = $1
       AND clinic_members.user_id = auth.uid()),
    NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific role in clinic
CREATE OR REPLACE FUNCTION has_clinic_role(clinic_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM clinic_members
     WHERE clinic_members.clinic_id = $1
       AND clinic_members.user_id = auth.uid()
       AND role = required_role),
    FALSE
  )::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
