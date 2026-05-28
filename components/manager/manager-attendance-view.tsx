// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SegmentedProgressRing } from "@/components/manager/segmented-progress-ring";
import { createClient } from "@/lib/supabase";
import type { StaffAttendanceStat } from "@/lib/manager-attendance";

type Props = {
  month: string;
  stats: StaffAttendanceStat[];
};

export function ManagerAttendanceView({ month, stats }: Props) {
  const router = useRouter();

  const handleMonthChange = (value: string) => {
    if (!value) return;
    router.push(`/manager?month=${value}`);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const monthLabel = format(new Date(`${month}-01`), "MMMM yyyy");

  return (
    <div className="mx-auto max-w-6xl bg-neutral-50 p-4 pb-24 md:pb-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Staff Attendance</h1>
          <p className="text-sm text-neutral-600">{monthLabel}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="min-h-touch shrink-0">
          <LogOut className="mr-1 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          type="month"
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
        />
      </div>

      {stats.length === 0 ? (
        <p className="py-12 text-center text-neutral-600">No staff found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col items-center p-6 text-center"
            >
              <p className="font-semibold text-neutral-900">{s.name}</p>
              <div className="my-4">
                <SegmentedProgressRing
                  percent={s.percent}
                  label={`${s.name}: ${Math.round(s.percent)}% attendance`}
                />
              </div>
              <p className="text-sm text-neutral-600">
                {s.daysWorked} {s.daysWorked === 1 ? "day" : "days"} worked
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
