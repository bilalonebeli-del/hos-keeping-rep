// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import type { Staff } from "@/lib/types";
import { countCompletedTasks, calcIdleMinutes } from "@/lib/types";
import { downloadCSV } from "@/lib/utils/csv-export";

type Props = {
  reports: ReportWithRelations[];
  staff: Staff[];
  from: string;
  to: string;
};

export default function TabStaffPerformance({ reports, staff, from, to }: Props) {
  const rows = useMemo(() => {
    const filtered = reports.filter((r) => r.date >= from && r.date <= to);

    return staff.map((s) => {
      const staffReports = filtered.filter((r) => r.staff_id === s.id);
      const totalReports = staffReports.length;
      const totalTasks = staffReports.reduce((sum, r) => sum + countCompletedTasks(r), 0);
      const totalMinutes = staffReports.reduce((sum, r) => sum + r.time_elapsed_minutes, 0);
      const avgTasks = totalReports > 0 ? (totalTasks / totalReports).toFixed(1) : "0";

      return {
        name: s.name,
        employee_id: s.employee_id,
        reports: totalReports,
        tasks: totalTasks,
        avgTasks,
        totalMinutes,
        idleMinutes: staffReports.reduce((sum, r) => sum + calcIdleMinutes(r), 0),
      };
    }).filter((r) => r.reports > 0);
  }, [reports, staff, from, to]);

  const handleExport = () => {
    downloadCSV(rows, `staff-performance-${from}-${to}.csv`);
  };

  if (rows.length === 0) {
    return <p className="text-neutral-600 text-center py-8">No performance data in range.</p>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExport} className="min-h-touch">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 max-h-[500px] overflow-y-auto">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b bg-neutral-50">
              <th className="p-3 text-left font-medium">Staff</th>
              <th className="p-3 text-left font-medium">Employee ID</th>
              <th className="p-3 text-right font-medium">Reports</th>
              <th className="p-3 text-right font-medium">Tasks</th>
              <th className="p-3 text-right font-medium">Avg Tasks</th>
              <th className="p-3 text-right font-medium">Total Min</th>
              <th className="p-3 text-right font-medium">Idle Min</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.employee_id} className="border-b">
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.employee_id}</td>
                <td className="p-3 text-right">{row.reports}</td>
                <td className="p-3 text-right">{row.tasks}</td>
                <td className="p-3 text-right">{row.avgTasks}</td>
                <td className="p-3 text-right">{row.totalMinutes}</td>
                <td className="p-3 text-right">{row.idleMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
