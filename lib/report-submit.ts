import { createClient } from "@/lib/supabase";
import { calcElapsedMinutes, toTimestamptz } from "@/lib/timezone";
import type { ReportFormValues } from "@/lib/validations/report";

export async function submitReport(values: ReportFormValues) {
  const supabase = createClient();
  const elapsed = calcElapsedMinutes(values.time_in, values.time_out, values.date);

  const payload = {
    staff_id: values.staff_id,
    store_id: values.store_id,
    date: values.date,
    shift: values.shift,
    time_in: toTimestamptz(values.date, values.time_in),
    time_out: toTimestamptz(values.date, values.time_out),
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

  const { error } = await supabase.from("reports").insert(payload);
  if (error) throw error;
  return { ...payload, time_elapsed_minutes: elapsed };
}
