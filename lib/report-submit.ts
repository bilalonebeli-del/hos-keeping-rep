// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

import { createClient } from "@/lib/supabase";
import { calcElapsedMinutes } from "@/lib/timezone";
import type { ReportFormValues } from "@/lib/validations/report";

function toPgTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export async function submitReport(values: ReportFormValues) {
  const supabase = createClient();
  const elapsed = calcElapsedMinutes(values.time_in, values.time_out, values.date);

  const payload = {
    staff_id: values.staff_id,
    store_id: values.store_id,
    date: values.date,
    shift: values.shift,
    time_in: toPgTime(values.time_in),
    time_out: toPgTime(values.time_out),
    time_elapsed_minutes: elapsed,
    dry_mop: values.dry_mop,
    wet_mop: values.wet_mop,
    carton_collection: values.carton_collection,
    trash_disposal: values.trash_disposal,
    vacuum_cleaning: values.vacuum_cleaning,
    roof_cleaning: values.roof_cleaning,
    general_assistance: values.general_assistance,
    emergency_assistance: values.emergency_assistance,
    remarks: values.remarks || null,
    supervisor_name: values.supervisor_name,
    supervisor_employee_id: values.supervisor_employee_id.toUpperCase(),
    supervisor_signature: values.supervisor_signature,
    supervisor_notes: values.supervisor_notes || null,
  };

  console.log("SUBMIT PAYLOAD:", payload);

  const { data, error } = await supabase.from("reports").insert([payload]).select();

  if (error) {
    console.error("SUPABASE INSERT ERROR:", error);
    if (typeof window !== "undefined") {
      alert("Submit failed: " + error.message);
    }
    return null;
  }

  return data?.[0] ?? { ...payload, time_elapsed_minutes: elapsed };
}
