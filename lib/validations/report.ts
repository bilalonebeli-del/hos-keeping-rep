import { z } from "zod";

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
    supervisor_id: z.string().uuid().optional().or(z.literal("")),
  })
  .refine((data) => data.time_out > data.time_in, {
    message: "Time out must be after time in",
    path: ["time_out"],
  });

export type ReportFormValues = z.infer<typeof reportSchema>;
