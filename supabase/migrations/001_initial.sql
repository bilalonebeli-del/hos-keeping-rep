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
insert into staff (id, name, ltr) values
  ('b1000001-0001-4001-8001-000000000001', 'Anees Ahamed Anwar Din', 'LTR-1444'),
  ('b1000001-0001-4001-8001-000000000002', 'Belal Ahmad', 'LTR-2526'),
  ('b1000001-0001-4001-8001-000000000003', 'Beth Gakenia Wanjiku', 'LTR-1772'),
  ('b1000001-0001-4001-8001-000000000004', 'Ddiba Abbas', 'LTR-2625'),
  ('b1000001-0001-4001-8001-000000000005', 'Jeferson Viernes Gumangan', 'LTR-2614'),
  ('b1000001-0001-4001-8001-000000000006', 'Mahendhar Simharaju', 'LTR-2408'),
  ('b1000001-0001-4001-8001-000000000007', 'Michael Kawalya', 'LTR-1769'),
  ('b1000001-0001-4001-8001-000000000008', 'Mohamed Safran Mohamed Kaleel', 'LTR-1916'),
  ('b1000001-0001-4001-8001-000000000009', 'Netra Bahadur Mahato', 'LTR-2435'),
  ('b1000001-0001-4001-8001-000000000010', 'Nisha Dhungana', 'LTR-1917'),
  ('b1000001-0001-4001-8001-000000000011', 'Oshada Chathuranga Migalahandi', 'LTR-2422'),
  ('b1000001-0001-4001-8001-000000000012', 'Santila Paudel Rena', 'LTR-2547'),
  ('b1000001-0001-4001-8001-000000000013', 'Shankar Yogi', 'LTR-1762')
on conflict (ltr) do nothing;

-- Seed stores
insert into stores (id, code, name) values
  ('a1000001-0001-4001-8001-000000000001', 'AU01', 'Flagship ADDF Supermarket'),
  ('a1000001-0001-4001-8001-000000000002', 'AU02', 'Le Gourmet'),
  ('a1000001-0001-4001-8001-000000000003', 'AU03', 'Entry to Pier C - RU2027'),
  ('a1000001-0001-4001-8001-000000000004', 'AU04', 'Beauty Studio - RU2028'),
  ('a1000001-0001-4001-8001-000000000005', 'AU05', 'Entry to Pier B - RU2041'),
  ('a1000001-0001-4001-8001-000000000006', 'AU06', 'Le Club - RU2101'),
  ('a1000001-0001-4001-8001-000000000007', 'AU07', 'Last minute D - RU2141'),
  ('a1000001-0001-4001-8001-000000000008', 'AU09', 'Last minute B - RU2163'),
  ('a1000001-0001-4001-8001-000000000009', 'AU10', 'Little Scent - RU2099'),
  ('a1000001-0001-4001-8001-000000000010', 'AU11', 'Last Minute A - RU2114'),
  ('a1000001-0001-4001-8001-000000000011', 'AU12', 'Arrival store - RU1001'),
  ('a1000001-0001-4001-8001-000000000012', 'AU13', 'SAMSONITE'),
  ('a1000001-0001-4001-8001-000000000013', 'AU14', 'Last Minute C-RU2156')
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
