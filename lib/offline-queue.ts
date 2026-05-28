// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

import type { ReportFormValues } from "@/lib/validations/report";

const KEY = "hk_pending_reports";

export type PendingReport = ReportFormValues & {
  _localId: string;
  time_elapsed_minutes: number;
  queued_at: string;
};

export function queueReport(report: Omit<PendingReport, "_localId" | "queued_at">) {
  const pending = getPending();
  pending.push({
    ...report,
    _localId: crypto.randomUUID(),
    queued_at: new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(pending));
}

export function getPending(): PendingReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function removePending(localId: string) {
  const pending = getPending().filter((r) => r._localId !== localId);
  localStorage.setItem(KEY, JSON.stringify(pending));
}

export function getPendingCount(): number {
  return getPending().length;
}
