"use client";

import type { ReportFormValues } from "@/lib/validations/report";
import type { Staff, Store } from "@/lib/types";
import { TASK_FIELDS } from "@/lib/types";

type PrintData = ReportFormValues & {
  time_elapsed_minutes: number;
  staff?: Staff;
  store?: Store;
};

export function printReport(data: PrintData) {
  const staffLabel = data.staff ? `${data.staff.name} - ${data.staff.employee_id}` : data.staff_id;
  const storeLabel = data.store ? `${data.store.name}` : data.store_id;
  const supervisorLabel = `${data.supervisor_name} - ${data.supervisor_employee_id}`;
  const tasks = TASK_FIELDS.filter((t) => data[t.key]).map((t) => t.label).join(", ") || "None";
  const signatureImg = data.supervisor_signature
    ? `<img src="${data.supervisor_signature}" alt="Supervisor signature" style="max-width:200px;height:auto;border:1px solid #ddd" />`
    : "—";

  const html = `<!DOCTYPE html><html><head><title>Housekeeping Report</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;max-width:600px;margin:0 auto}
h1{font-size:20px;color:#0f766e}table{width:100%;border-collapse:collapse;margin-top:16px}
td,th{padding:8px;border:1px solid #ddd;text-align:left}th{background:#f0fdfa}</style></head><body>
<h1>Daily Housekeeping Report</h1>
<table>
<tr><th>Staff</th><td>${staffLabel}</td></tr>
<tr><th>Store</th><td>${storeLabel}</td></tr>
<tr><th>Date</th><td>${data.date}</td></tr>
<tr><th>Shift</th><td>${data.shift}</td></tr>
<tr><th>Time In</th><td>${data.time_in}</td></tr>
<tr><th>Time Out</th><td>${data.time_out}</td></tr>
<tr><th>Elapsed</th><td>${data.time_elapsed_minutes} min</td></tr>
<tr><th>Tasks</th><td>${tasks}</td></tr>
<tr><th>Remarks</th><td>${data.remarks || "—"}</td></tr>
<tr><th>Supervisor</th><td>${supervisorLabel}</td></tr>
<tr><th>Supervisor Notes</th><td>${data.supervisor_notes || "—"}</td></tr>
<tr><th>Signature</th><td>${signatureImg}</td></tr>
</table>
<p style="margin-top:24px;font-size:12px;color:#666">Generated ${new Date().toLocaleString()}</p>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
