import { createClient } from "@/lib/supabase";
import { calcElapsedMinutes, toTimestamptz } from "@/lib/timezone";
import type { ReportFormValues } from "@/lib/validations/report";

/**
 * Set to true after running supabase/migrations/002_supervisor_confirmation.sql
 * in your Supabase project.
 */
const INCLUDE_SUPERVISOR_COLUMNS = false;

function buildRemarksWithSupervisor(values: ReportFormValues): string | null {
  const lines: string[] = [];
  if (values.remarks?.trim()) lines.push(values.remarks.trim());
  lines.push(
    `Supervisor: ${values.supervisor_name} (${values.supervisor_employee_id.toUpperCase()})`
  );
  if (values.supervisor_notes?.trim()) {
    lines.push(`Supervisor notes: ${values.supervisor_notes.trim()}`);
  }
  if (values.supervisor_signature) {
    lines.push("[Supervisor signature captured — enable migration 002 to store in DB]");
  }
  return lines.length > 0 ? lines.join("\n") : null;
}

export async function submitReport(values: ReportFormValues) {
  const supabase = createClient();
  const elapsed = calcElapsedMinutes(values.time_in, values.time_out, values.date);

  const payload: Record<string, unknown> = {
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
    remarks: INCLUDE_SUPERVISOR_COLUMNS
      ? values.remarks || null
      : buildRemarksWithSupervisor(values),
  };

  if (INCLUDE_SUPERVISOR_COLUMNS) {
    payload.supervisor_name = values.supervisor_name;
    payload.supervisor_employee_id = values.supervisor_employee_id.toUpperCase();
    payload.supervisor_signature = values.supervisor_signature;
    payload.supervisor_notes = values.supervisor_notes || null;
  }

  // Columns below exist only if migration 002 was applied — left commented for testing:
  // payload.supervisor_name = values.supervisor_name;
  // payload.supervisor_employee_id = values.supervisor_employee_id.toUpperCase();
  // payload.supervisor_signature = values.supervisor_signature;
  // payload.supervisor_notes = values.supervisor_notes || null;

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
