// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

import { z } from "zod";

const ltrPattern = /^LTR-\d{4}$/i;

export const reportSchema = z
  .object({
    staff_id: z.string().uuid("Select a staff member"),
    store_id: z.string().uuid("Select a store"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    shift: z.enum(["Morning", "Afternoon", "Night"]),
    time_in: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time in"),
    time_out: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time out"),
    dry_mop: z.boolean(),
    wet_mop: z.boolean(),
    carton_collection: z.boolean(),
    trash_disposal: z.boolean(),
    vacuum_cleaning: z.boolean(),
    roof_cleaning: z.boolean(),
    general_assistance: z.boolean(),
    emergency_assistance: z.boolean(),
    remarks: z.string().optional(),
    supervisor_name: z.string().min(1, "Supervisor name is required"),
    supervisor_employee_id: z
      .string()
      .min(1, "LTR number is required")
      .regex(ltrPattern, "Use format LTR-xxxx (e.g. LTR-1444)"),
    supervisor_signature: z.string().min(1, "Supervisor signature is required"),
    supervisor_notes: z.string().optional(),
  })
  .refine((data) => data.time_out > data.time_in, {
    message: "Time out must be after time in",
    path: ["time_out"],
  });

export type ReportFormValues = z.infer<typeof reportSchema>;
