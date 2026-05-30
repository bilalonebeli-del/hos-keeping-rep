-- Manager task completion matrix view (all staff × all stores, zeros included)
-- Run in Supabase SQL Editor if the view is missing.

create or replace view public.manager_task_matrix as
select
  stf.name as staff_name,
  sto.name as store_name,
  count(r.id)::bigint as reports,
  coalesce(sum(case when coalesce(r.dry_mop, false) then 1 else 0 end), 0)::bigint as dry_mop,
  coalesce(sum(case when coalesce(r.wet_mop, false) then 1 else 0 end), 0)::bigint as wet_mop,
  coalesce(sum(case when coalesce(r.carton_collection, false) then 1 else 0 end), 0)::bigint as carton,
  coalesce(sum(case when coalesce(r.trash_disposal, false) then 1 else 0 end), 0)::bigint as trash,
  coalesce(sum(case when coalesce(r.vacuum_cleaning, false) then 1 else 0 end), 0)::bigint as vacuum,
  coalesce(sum(case when coalesce(r.roof_cleaning, false) then 1 else 0 end), 0)::bigint as roof,
  coalesce(sum(case when coalesce(r.general_assistance, false) then 1 else 0 end), 0)::bigint as general,
  coalesce(sum(case when coalesce(r.emergency_assistance, false) then 1 else 0 end), 0)::bigint as emergency
from public.staff stf
cross join public.stores sto
left join public.reports r
  on r.staff_id = stf.id
 and r.store_id = sto.id
group by stf.name, sto.name
order by stf.name, sto.name;

grant select on public.manager_task_matrix to anon, authenticated;
