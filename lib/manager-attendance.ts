// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

import { differenceInCalendarDays, parseISO } from "date-fns";

export type StaffAttendanceStat = {
  id: string;
  name: string;
  daysWorked: number;
  percent: number;
};

export function computeStaffAttendance(
  staff: { id: string; name: string }[],
  reports: { staff_id: string; date: string }[],
  periodStart: string,
  periodEnd: string
): StaffAttendanceStat[] {
  const start = parseISO(periodStart);
  const end = parseISO(periodEnd);
  const totalDays = differenceInCalendarDays(end, start) + 1;

  return staff.map((s) => {
    const dates = new Set(
      reports.filter((r) => r.staff_id === s.id).map((r) => r.date)
    );
    const daysWorked = dates.size;
    const percent = totalDays > 0 ? (daysWorked / totalDays) * 100 : 0;

    return {
      id: s.id,
      name: s.name,
      daysWorked,
      percent,
    };
  });
}
