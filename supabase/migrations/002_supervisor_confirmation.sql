-- Supervisor confirmation fields (replaces supervisor_id dropdown)
alter table reports
  add column if not exists supervisor_name text,
  add column if not exists supervisor_employee_id text,
  add column if not exists supervisor_signature text,
  add column if not exists supervisor_notes text;

-- supervisor_id remains for legacy rows; new submissions use confirmation fields
