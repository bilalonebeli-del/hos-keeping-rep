"use client";

import { useMemo } from "react";
import type { ReportWithRelations } from "@/lib/dashboard-queries";
import { TASK_FIELDS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type Props = {
  reports: ReportWithRelations[];
  date: string;
};

export default function TabRepetitionTable({ reports, date }: Props) {
  const rows = useMemo(() => {
    const dayReports = reports.filter((r) => r.date === date);
    const byStore = new Map<string, ReportWithRelations[]>();

    for (const r of dayReports) {
      const key = r.store_id;
      if (!byStore.has(key)) byStore.set(key, []);
      byStore.get(key)!.push(r);
    }

    return Array.from(byStore.entries()).map(([storeId, storeReports]) => {
      const taskStatus = Object.fromEntries(
        TASK_FIELDS.map((t) => [
          t.key,
          storeReports.some((r) => r[t.key]),
        ])
      );
      return { storeId, name: storeReports[0].store.name, taskStatus };
    });
  }, [reports, date]);

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No reports for this date.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[640px] text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 bg-muted/50 p-3 text-left font-medium">Store</th>
            {TASK_FIELDS.map((t) => (
              <th key={t.key} className="p-3 text-center font-medium whitespace-nowrap">
                {t.label.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.storeId} className="border-b">
              <td className="sticky left-0 bg-background p-3 font-medium">
                <span className="block truncate max-w-[200px]">{row.name}</span>
              </td>
              {TASK_FIELDS.map((t) => (
                <td key={t.key} className="p-3 text-center">
                  <Badge variant={row.taskStatus[t.key] ? "success" : "outline"}>
                    {row.taskStatus[t.key] ? "✓" : "—"}
                  </Badge>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
