// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

export type Staff = {
  id: string;
  name: string;
  employee_id: string;
};

export type Store = {
  id: string;
  name: string;
  code?: string;
};

export type Shift = "Morning" | "Afternoon" | "Night";

export type Report = {
  id: string;
  staff_id: string;
  store_id: string;
  date: string;
  shift: Shift;
  time_in: string;
  time_out: string;
  time_elapsed_minutes: number;
  dry_mop: boolean;
  wet_mop: boolean;
  carton_collection: boolean;
  trash_disposal: boolean;
  vacuum_cleaning: boolean;
  roof_cleaning: boolean;
  general_assistance: boolean;
  emergency_assistance: boolean;
  remarks: string | null;
  supervisor_id: string | null;
  supervisor_name: string | null;
  supervisor_employee_id: string | null;
  supervisor_signature: string | null;
  supervisor_notes: string | null;
  created_at: string;
  staff?: Staff;
  store?: Store;
};

export const TASK_FIELDS = [
  { key: "dry_mop" as const, label: "Dry Mop" },
  { key: "wet_mop" as const, label: "Wet Mop" },
  { key: "carton_collection" as const, label: "Carton Collection" },
  { key: "trash_disposal" as const, label: "Trash Disposal" },
  { key: "vacuum_cleaning" as const, label: "Vacuum Cleaning" },
  { key: "roof_cleaning" as const, label: "Roof Cleaning" },
  { key: "general_assistance" as const, label: "General Assistance" },
  { key: "emergency_assistance" as const, label: "Emergency Assistance" },
];

export const AVG_TASK_MINUTES = 15;

export function countCompletedTasks(report: Pick<Report, (typeof TASK_FIELDS)[number]["key"]>) {
  return TASK_FIELDS.filter((t) => report[t.key]).length;
}

export function calcIdleMinutes(report: Pick<Report, "time_elapsed_minutes" | (typeof TASK_FIELDS)[number]["key"]>) {
  return Math.max(0, report.time_elapsed_minutes - countCompletedTasks(report) * AVG_TASK_MINUTES);
}
