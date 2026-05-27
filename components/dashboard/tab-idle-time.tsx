"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { calcIdleMinutes, countCompletedTasks, AVG_TASK_MINUTES } from "@/lib/types";

type Props = {
  reports: ReportWithRelations[];
  date: string;
};

export default function TabIdleTime({ reports, date }: Props) {
  const cards = useMemo(() => {
    return reports
      .filter((r) => r.date === date)
      .map((r) => {
        const tasks = countCompletedTasks(r);
        const taskTime = tasks * AVG_TASK_MINUTES;
        const idle = calcIdleMinutes(r);
        return {
          id: r.id,
          staff: r.staff.name,
          store: r.store.code,
          elapsed: r.time_elapsed_minutes,
          taskTime,
          tasks,
          idle,
        };
      })
      .sort((a, b) => b.idle - a.idle);
  }, [reports, date]);

  if (cards.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No reports for this date.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{c.staff}</CardTitle>
            <p className="text-sm text-muted-foreground">{c.store}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Elapsed</span>
              <span className="font-medium">{c.elapsed} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tasks ({c.tasks} × {AVG_TASK_MINUTES}m)</span>
              <span className="font-medium">{c.taskTime} min</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Idle Time</span>
              <Badge variant={c.idle > 60 ? "warning" : "success"}>{c.idle} min</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
