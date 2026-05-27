"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { TASK_FIELDS, countCompletedTasks } from "@/lib/types";

type Props = {
  reports: ReportWithRelations[];
  staffId: string;
  date: string;
};

export default function TabDailyStaff({ reports, staffId, date }: Props) {
  const staffReports = useMemo(
    () => reports.filter((r) => r.date === date && (staffId === "all" || !staffId || r.staff_id === staffId)),
    [reports, date, staffId]
  );

  if (staffReports.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No reports found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {staffReports.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{r.staff.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {r.store.code} · {r.shift} · {r.time_in.slice(11, 16)}–{r.time_out.slice(11, 16)}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{r.time_elapsed_minutes} min</span> elapsed
            </p>
            <div className="flex flex-wrap gap-1">
              {TASK_FIELDS.filter((t) => r[t.key]).map((t) => (
                <Badge key={t.key} variant="success">
                  {t.label}
                </Badge>
              ))}
              {countCompletedTasks(r) === 0 && (
                <Badge variant="outline">No tasks marked</Badge>
              )}
            </div>
            {r.remarks && <p className="text-sm text-muted-foreground">{r.remarks}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
