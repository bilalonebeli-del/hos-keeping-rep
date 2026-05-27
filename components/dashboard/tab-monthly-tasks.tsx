"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { TASK_FIELDS } from "@/lib/types";
import { format, startOfMonth, endOfMonth } from "date-fns";

type Props = {
  reports: ReportWithRelations[];
  month: string;
};

const COLORS = ["#0f766e", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#115e59", "#134e4a", "#042f2e"];

export default function TabMonthlyTasks({ reports, month }: Props) {
  const data = useMemo(() => {
    const start = startOfMonth(new Date(`${month}-01`));
    const end = endOfMonth(start);
    const from = format(start, "yyyy-MM-dd");
    const to = format(end, "yyyy-MM-dd");

    const monthReports = reports.filter((r) => r.date >= from && r.date <= to);

    return TASK_FIELDS.map((t) => ({
      name: t.label,
      value: monthReports.filter((r) => r[t.key]).length,
    })).filter((d) => d.value > 0);
  }, [reports, month]);

  if (data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No task data for this month.</p>;
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
