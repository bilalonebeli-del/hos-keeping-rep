// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { TASK_FIELDS } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-colors";

type Props = {
  reports: ReportWithRelations[];
  date: string;
};

export default function TabTimePerStore({ reports, date }: Props) {
  const data = useMemo(() => {
    const dayReports = reports.filter((r) => r.date === date);
    const byStore = new Map<string, Record<string, number>>();

    for (const report of dayReports) {
      const storeName = report.store.name;
      if (!byStore.has(storeName)) {
        byStore.set(storeName, Object.fromEntries(TASK_FIELDS.map((t) => [t.label, 0])));
      }
      const entry = byStore.get(storeName)!;
      for (const task of TASK_FIELDS) {
        if (report[task.key]) {
          entry[task.label] += report.time_elapsed_minutes;
        }
      }
    }

    return Array.from(byStore.entries()).map(([store, tasks]) => ({
      store,
      ...tasks,
    }));
  }, [reports, date]);

  if (data.length === 0) {
    return <p className="text-neutral-600 text-center py-8">No reports for this date.</p>;
  }

  const colors = CHART_COLORS;

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[600px] h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit=" min" />
            <YAxis type="category" dataKey="store" width={60} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {TASK_FIELDS.map((t, i) => (
              <Bar key={t.key} dataKey={t.label} stackId="a" fill={colors[i % colors.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
