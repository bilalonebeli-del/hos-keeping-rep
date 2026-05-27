"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import type { Store } from "@/lib/types";
import { countCompletedTasks } from "@/lib/types";

type Props = {
  reports: ReportWithRelations[];
  stores: Store[];
  date: string;
};

export default function TabDailyCompletion({ reports, stores, date }: Props) {
  const cards = useMemo(() => {
    const dayReports = reports.filter((r) => r.date === date);

    return stores.map((store) => {
      const storeReports = dayReports.filter((r) => r.store_id === store.id);
      const totalTasks = storeReports.reduce((sum, r) => sum + countCompletedTasks(r), 0);
      const maxTasks = storeReports.length * 8;
      const pct = maxTasks > 0 ? Math.round((totalTasks / maxTasks) * 100) : 0;

      return {
        store,
        reportCount: storeReports.length,
        totalTasks,
        pct,
      };
    });
  }, [reports, stores, date]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map(({ store, reportCount, totalTasks, pct }) => (
        <Card key={store.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{store.code}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{store.name}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={pct >= 75 ? "success" : pct >= 50 ? "warning" : "secondary"}>
                {pct}% complete
              </Badge>
              <span className="text-sm text-muted-foreground">
                {reportCount} reports · {totalTasks} tasks
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
