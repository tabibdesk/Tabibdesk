-- Add condition_flags JSONB for extensible medical condition storage
-- New conditions (e.g. has_afib, smoking_status) stored here
-- Legacy boolean columns (is_diabetic, etc.) remain for backward compatibility
-- API/UI merges both when reading; new conditions read/write condition_flags

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS condition_flags JSONB DEFAULT '{}';

COMMENT ON COLUMN patients.condition_flags IS 'Extensible medical condition flags { condition_id: boolean }. Merged with legacy boolean columns at read time.';
