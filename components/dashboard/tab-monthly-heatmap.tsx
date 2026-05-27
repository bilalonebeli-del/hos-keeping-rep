"use client";

import { useMemo, useState } from "react";
import { addMonths, subMonths, format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { countCompletedTasks } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  reports: ReportWithRelations[];
};

export default function TabMonthlyHeatmap({ reports }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const heatmap = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const monthReports = reports.filter((r) => r.date.startsWith(format(month, "yyyy-MM")));

    const byDate = new Map<string, number>();
    for (const r of monthReports) {
      const tasks = countCompletedTasks(r);
      byDate.set(r.date, (byDate.get(r.date) ?? 0) + tasks);
    }

    const max = Math.max(1, ...Array.from(byDate.values()));
    const startPad = getDay(start);

    return { days, byDate, max, startPad };
  }, [reports, month]);

  const level = (count: number) => {
    if (count === 0) return "bg-muted";
    const ratio = count / heatmap.max;
    if (ratio > 0.75) return "bg-teal-700";
    if (ratio > 0.5) return "bg-teal-500";
    if (ratio > 0.25) return "bg-teal-300";
    return "bg-teal-100";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h3>
        <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: heatmap.startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {heatmap.days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = heatmap.byDate.get(key) ?? 0;
          return (
            <div
              key={key}
              className={cn("aspect-square rounded-sm flex items-center justify-center text-xs font-medium", level(count))}
              title={`${key}: ${count} tasks`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
