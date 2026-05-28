// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

import { createClient } from "@/lib/supabase";
import type { Report, Staff, Store } from "@/lib/types";

export type ReportWithRelations = Report & {
  staff: Staff;
  store: Store;
};

export async function fetchReports(from: string, to: string): Promise<ReportWithRelations[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(`
      *,
      staff:staff_id(id, name, employee_id),
      store:store_id(id, name)
    `)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReportWithRelations[];
}

export async function fetchStaffAndStores() {
  const supabase = createClient();
  const [staffRes, storesRes] = await Promise.all([
    supabase.from("staff").select("id,name,employee_id").order("name"),
    supabase.from("stores").select("id,name").order("name"),
  ]);
  return {
    staff: (staffRes.data ?? []) as Staff[],
    stores: (storesRes.data ?? []) as Store[],
  };
}
