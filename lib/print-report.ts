// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import type { ReportFormValues } from "@/lib/validations/report";
import type { Staff, Store } from "@/lib/types";
import { TASK_FIELDS } from "@/lib/types";

type PrintData = ReportFormValues & {
  time_elapsed_minutes: number;
  staff?: Staff;
  store?: Store;
};

const LOGO_PATH = "/images/lagardere-logo.png";

function buildReportHtml(data: PrintData) {
  const staffLabel = data.staff ? `${data.staff.name} - ${data.staff.employee_id}` : data.staff_id;
  const storeLabel = data.store ? `${data.store.name}` : data.store_id;
  const supervisorLabel = `${data.supervisor_name} - ${data.supervisor_employee_id}`;
  const tasks = TASK_FIELDS.filter((t) => data[t.key]).map((t) => t.label).join(", ") || "None";
  const signatureImg = data.supervisor_signature
    ? `<img src="${data.supervisor_signature}" alt="Supervisor signature" style="max-width:200px;height:auto;border:1px solid #ddd" />`
    : "—";

  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${LOGO_PATH}`
      : LOGO_PATH;

  return `<!DOCTYPE html><html><head><title>Housekeeping Report</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;max-width:600px;margin:0 auto}
.header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e2e8f0}
.header img{max-width:280px;width:100%;height:auto;display:block;margin:0 auto}
h1{font-size:20px;color:#0d9488;margin-top:16px}table{width:100%;border-collapse:collapse;margin-top:16px}
td,th{padding:8px;border:1px solid #e2e8f0;text-align:left}th{background:#f0fdfa;color:#0f172a}
@media print{.header img{max-width:240px}}</style></head><body>
<header class="header">
<img src="${logoUrl}" alt="Lagardère Travel Retail" />
<h1>Daily Housekeeping Report</h1>
</header>
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
<p style="margin-top:24px;font-size:12px;color:#475569">Generated ${new Date().toLocaleString()}</p>
</body></html>`;
}

export function printReport(data: PrintData) {
  const html = buildReportHtml(data);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print report");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    iframe.remove();
    return;
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    window.setTimeout(() => {
      iframe.remove();
      window.focus();
    }, 500);
  };

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const runPrint = () => {
    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    try {
      frameWindow.focus();
      frameWindow.print();
    } catch {
      cleanup();
      return;
    }
    // Fallback if afterprint does not fire (some mobile browsers)
    window.setTimeout(cleanup, 3000);
  };

  const logo = frameDoc.querySelector("img");
  if (logo && !(logo as HTMLImageElement).complete) {
    logo.addEventListener("load", runPrint, { once: true });
    logo.addEventListener("error", runPrint, { once: true });
  } else {
    runPrint();
  }
}
