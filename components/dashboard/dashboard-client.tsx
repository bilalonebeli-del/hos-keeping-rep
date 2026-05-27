"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartSkeleton, CardGridSkeleton, TableSkeleton } from "@/components/dashboard/chart-skeleton";
import { fetchReports, fetchStaffAndStores, type ReportWithRelations } from "@/lib/dashboard-queries";
import { createClient } from "@/lib/supabase";
import { todayInTZ } from "@/lib/timezone";
import type { Staff, Store } from "@/lib/types";
import { useRouter } from "next/navigation";

const TabTimePerStore = dynamic(() => import("@/components/dashboard/tab-time-per-store"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
const TabDailyCompletion = dynamic(() => import("@/components/dashboard/tab-daily-completion"), {
  loading: () => <CardGridSkeleton />,
  ssr: false,
});
const TabMonthlyHeatmap = dynamic(() => import("@/components/dashboard/tab-monthly-heatmap"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
const TabRepetitionTable = dynamic(() => import("@/components/dashboard/tab-repetition-table"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});
const TabMonthlyTasks = dynamic(() => import("@/components/dashboard/tab-monthly-tasks"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
const TabDailyStaff = dynamic(() => import("@/components/dashboard/tab-daily-staff"), {
  loading: () => <CardGridSkeleton />,
  ssr: false,
});
const TabStaffPerformance = dynamic(() => import("@/components/dashboard/tab-staff-performance"), {
  loading: () => <TableSkeleton />,
  ssr: false,
});
const TabIdleTime = dynamic(() => import("@/components/dashboard/tab-idle-time"), {
  loading: () => <CardGridSkeleton />,
  ssr: false,
});

export function DashboardClient() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayInTZ());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [rangeFrom, setRangeFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [rangeTo, setRangeTo] = useState(todayInTZ());
  const [selectedStaffId, setSelectedStaffId] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const monthStart = format(startOfMonth(new Date(`${selectedMonth}-01`)), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(new Date(`${selectedMonth}-01`)), "yyyy-MM-dd");
        const from = rangeFrom < monthStart ? rangeFrom : monthStart;
        const to = rangeTo > monthEnd ? rangeTo : monthEnd;

        const [{ staff: s, stores: st }, reps] = await Promise.all([
          fetchStaffAndStores(),
          fetchReports(from, to),
        ]);
        setStaff(s);
        setStores(st);
        setReports(reps);
        if (s.length > 0 && !selectedStaffId) setSelectedStaffId(s[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedMonth, rangeFrom, rangeTo, selectedStaffId]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 animate-pulse rounded bg-neutral-100" />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl bg-neutral-50 p-4 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">Manager Dashboard</h2>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="min-h-touch">
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="time-per-store" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="time-per-store">Time/Store</TabsTrigger>
          <TabsTrigger value="daily-completion">Daily</TabsTrigger>
          <TabsTrigger value="monthly-heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="repetition">Repetition</TabsTrigger>
          <TabsTrigger value="monthly-tasks">Monthly</TabsTrigger>
          <TabsTrigger value="daily-staff">Staff Day</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="idle">Idle Time</TabsTrigger>
        </TabsList>

        <TabsContent value="time-per-store">
          <div className="mb-4">
            <Label htmlFor="date1">Date</Label>
            <Input id="date1" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-xs" />
          </div>
          <TabTimePerStore reports={reports} date={selectedDate} />
        </TabsContent>

        <TabsContent value="daily-completion">
          <div className="mb-4">
            <Label htmlFor="date2">Date</Label>
            <Input id="date2" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-xs" />
          </div>
          <TabDailyCompletion reports={reports} stores={stores} date={selectedDate} />
        </TabsContent>

        <TabsContent value="monthly-heatmap">
          <TabMonthlyHeatmap reports={reports} />
        </TabsContent>

        <TabsContent value="repetition">
          <div className="mb-4">
            <Label htmlFor="date3">Date</Label>
            <Input id="date3" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-xs" />
          </div>
          <TabRepetitionTable reports={reports} date={selectedDate} />
        </TabsContent>

        <TabsContent value="monthly-tasks">
          <div className="mb-4">
            <Label htmlFor="month">Month</Label>
            <Input id="month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="max-w-xs" />
          </div>
          <TabMonthlyTasks reports={reports} month={selectedMonth} />
        </TabsContent>

        <TabsContent value="daily-staff">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="date4">Date</Label>
              <Input id="date4" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <Label>Staff</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All staff</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.employee_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabDailyStaff reports={reports} staffId={selectedStaffId} date={selectedDate} />
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
            </div>
          </div>
          <TabStaffPerformance reports={reports} staff={staff} from={rangeFrom} to={rangeTo} />
        </TabsContent>

        <TabsContent value="idle">
          <div className="mb-4">
            <Label htmlFor="date5">Date</Label>
            <Input id="date5" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-xs" />
          </div>
          <TabIdleTime reports={reports} date={selectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
