-- Re-sync staff/store IDs to match lib/catalog.ts (for existing databases)
-- Run in Supabase SQL Editor if dropdown works but submit fails with foreign key errors.

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
on conflict (ltr) do update set name = excluded.name;

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
on conflict (code) do update set name = excluded.name;
