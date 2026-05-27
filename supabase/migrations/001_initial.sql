-- Daily Housekeeping Reports - Initial Schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ltr text not null unique
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id),
  store_id uuid not null references stores(id),
  date date not null,
  shift text not null check (shift in ('Morning', 'Afternoon', 'Night')),
  time_in timestamptz not null,
  time_out timestamptz not null,
  time_elapsed_minutes integer not null,
  dry_mop boolean default false,
  wet_mop boolean default false,
  carton_collection boolean default false,
  trash_disposal boolean default false,
  vacuum_cleaning boolean default false,
  roof_cleaning boolean default false,
  general_assistance boolean default false,
  emergency_assistance boolean default false,
  remarks text,
  supervisor_id uuid references staff(id),
  created_at timestamptz default now()
);

create index if not exists idx_reports_date on reports(date);
create index if not exists idx_reports_staff_id on reports(staff_id);
create index if not exists idx_reports_store_id on reports(store_id);

-- Seed staff
insert into staff (name, ltr) values
  ('Anees Ahamed Anwar Din', 'LTR-1444'),
  ('Belal Ahmad', 'LTR-2526'),
  ('Beth Gakenia Wanjiku', 'LTR-1772'),
  ('Ddiba Abbas', 'LTR-2625'),
  ('Jeferson Viernes Gumangan', 'LTR-2614'),
  ('Mahendhar Simharaju', 'LTR-2408'),
  ('Michael Kawalya', 'LTR-1769'),
  ('Mohamed Safran Mohamed Kaleel', 'LTR-1916'),
  ('Netra Bahadur Mahato', 'LTR-2435'),
  ('Nisha Dhungana', 'LTR-1917'),
  ('Oshada Chathuranga Migalahandi', 'LTR-2422'),
  ('Santila Paudel Rena', 'LTR-2547'),
  ('Shankar Yogi', 'LTR-1762')
on conflict (ltr) do nothing;

-- Seed stores
insert into stores (code, name) values
  ('AU01', 'Flagship ADDF Supermarket'),
  ('AU02', 'Le Gourmet'),
  ('AU03', 'Entry to Pier C - RU2027'),
  ('AU04', 'Beauty Studio - RU2028'),
  ('AU05', 'Entry to Pier B - RU2041'),
  ('AU06', 'Le Club - RU2101'),
  ('AU07', 'Last minute D - RU2141'),
  ('AU09', 'Last minute B - RU2163'),
  ('AU10', 'Little Scent - RU2099'),
  ('AU11', 'Last Minute A - RU2114'),
  ('AU12', 'Arrival store - RU1001'),
  ('AU13', 'SAMSONITE'),
  ('AU14', 'Last Minute C-RU2156')
on conflict (code) do nothing;

-- Row Level Security
alter table staff enable row level security;
alter table stores enable row level security;
alter table reports enable row level security;

drop policy if exists "Public read staff" on staff;
drop policy if exists "Public read stores" on stores;
drop policy if exists "Public insert reports" on reports;
drop policy if exists "Auth read reports" on reports;
drop policy if exists "Auth read staff" on staff;
drop policy if exists "Auth read stores" on stores;

create policy "Public read staff" on staff for select using (true);
create policy "Public read stores" on stores for select using (true);
create policy "Public insert reports" on reports for insert with check (true);
create policy "Auth read reports" on reports for select using (auth.role() = 'authenticated');
create policy "Auth read staff" on staff for select using (auth.role() = 'authenticated');
create policy "Auth read stores" on stores for select using (auth.role() = 'authenticated');
