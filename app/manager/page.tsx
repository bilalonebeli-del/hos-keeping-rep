"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Download, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { downloadCSV } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const MANAGER_KEY = "hk_manager";
const MANAGER_PASSWORD = "manager2026";
const SEGMENTS = 12;
const RING_SIZE = 120;
const STROKE = 10;
const GAP_DEG = 3;

type ReportRow = {
  id: string;
  staff_id: string;
  store_id: string;
  date: string;
  time_elapsed_minutes: number;
  dry_mop: boolean;
  wet_mop: boolean;
  vacuum_cleaning: boolean;
  trash_disposal: boolean;
  roof_cleaning: boolean;
  staff: { id: string; name: string } | null;
};

type StaffStat = {
  id: string;
  name: string;
  days: number;
  minutes: number;
  done: number;
  percentage: number;
  hours: number;
};

function defaultRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), "yyyy-MM-dd"),
    end: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

function taskDone(r: ReportRow) {
  return (
    Number(r.dry_mop) +
    Number(r.wet_mop) +
    Number(r.vacuum_cleaning) +
    Number(r.trash_disposal) +
    Number(r.roof_cleaning)
  );
}

function percentColor(percent: number) {
  if (percent >= 90) return "#0d9488";
  if (percent >= 70) return "#3b82f6";
  if (percent >= 50) return "#f59e0b";
  return "#ef4444";
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  if (endDeg <= startDeg) return "";
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function SegmentedRing({ percent }: { percent: number }) {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const r = (RING_SIZE - STROKE) / 2;
  const segDeg = 360 / SEGMENTS;
  const activeDeg = segDeg - GAP_DEG;
  const filledDeg = (Math.min(100, Math.max(0, percent)) / 100) * 360;
  const color = percentColor(percent);

  const arcs = Array.from({ length: SEGMENTS }, (_, i) => {
    const start = i * segDeg + GAP_DEG / 2;
    const end = start + activeDeg;
    const filledInSeg = Math.min(activeDeg, Math.max(0, filledDeg - start));
    return { start, end, filledInSeg };
  });

  return (
    <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
      {arcs.map((seg, i) => (
        <g key={i}>
          <path
            d={arcPath(cx, cy, r, seg.start, seg.end)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {seg.filledInSeg > 0 && (
            <path
              d={arcPath(cx, cy, r, seg.start, seg.start + seg.filledInSeg)}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

function normalizeReport(row: {
  id: string;
  staff_id: string;
  store_id: string;
  date: string;
  time_elapsed_minutes: number;
  dry_mop: boolean;
  wet_mop: boolean;
  vacuum_cleaning: boolean;
  trash_disposal: boolean;
  roof_cleaning: boolean;
  staff: { id: string; name: string } | { id: string; name: string }[] | null;
}): ReportRow {
  const staff = Array.isArray(row.staff) ? row.staff[0] ?? null : row.staff;
  return { ...row, staff };
}

function aggregateReports(rows: ReportRow[]): StaffStat[] {
  const byStaff = new Map<
    string,
    { name: string; days: number; minutes: number; done: number }
  >();

  for (const row of rows) {
    const name = row.staff?.name ?? "Unknown";
    const cur = byStaff.get(row.staff_id) ?? { name, days: 0, minutes: 0, done: 0 };
    cur.days += 1;
    cur.minutes += row.time_elapsed_minutes ?? 0;
    cur.done += taskDone(row);
    byStaff.set(row.staff_id, cur);
  }

  return Array.from(byStaff.entries())
    .map(([id, s]) => {
      const tasksPossible = s.days * 5;
      const percentage =
        tasksPossible > 0 ? Math.round((s.done / tasksPossible) * 100) : 0;
      const hours = Math.round((s.minutes / 60) * 10) / 10;
      return { id, name: s.name, days: s.days, minutes: s.minutes, done: s.done, percentage, hours };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function ManagerPage() {
  const defaults = defaultRange();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rangeStart, setRangeStart] = useState(defaults.start);
  const [rangeEnd, setRangeEnd] = useState(defaults.end);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(MANAGER_KEY) === "ok") {
      setAuthed(true);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: qErr } = await supabase
        .from("reports")
        .select(
          `
          id,
          staff_id,
          store_id,
          date,
          time_elapsed_minutes,
          dry_mop,
          wet_mop,
          vacuum_cleaning,
          trash_disposal,
          roof_cleaning,
          staff:staff_id(id, name)
        `
        )
        .gte("date", rangeStart)
        .lte("date", rangeEnd);

      if (qErr) throw qErr;
      setReports((data ?? []).map(normalizeReport));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const stats = useMemo(() => aggregateReports(reports), [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((s) => s.name.toLowerCase().includes(q));
  }, [stats, search]);

  const storesCleaned = useMemo(
    () => new Set(reports.map((r) => r.store_id)).size,
    [reports]
  );

  const kpis = useMemo(() => {
    const totalStaff = stats.length;
    const avgPct =
      totalStaff > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.percentage, 0) / totalStaff)
        : 0;
    const totalHours =
      Math.round(stats.reduce((sum, s) => sum + s.hours, 0) * 10) / 10;
    return { totalStaff, avgPct, totalHours, storesCleaned };
  }, [stats, storesCleaned]);

  const periodLabel = useMemo(() => {
    try {
      const start = parseISO(rangeStart);
      const end = parseISO(rangeEnd);
      if (format(start, "yyyy-MM") === format(end, "yyyy-MM")) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
    } catch {
      return "Selected period";
    }
  }, [rangeStart, rangeEnd]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MANAGER_PASSWORD) {
      localStorage.setItem(MANAGER_KEY, "ok");
      setAuthed(true);
      setLoginError("");
      return;
    }
    setLoginError("Incorrect password");
  };

  const handleExport = () => {
    downloadCSV(
      filtered.map((s) => ({
        name: s.name,
        percentage: s.percentage,
        days: s.days,
        hours: s.hours,
      })),
      `staff-performance-${rangeStart}-${rangeEnd}.csv`
    );
  };

  if (!authed) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-50 p-4">
        <Card className="w-full max-w-sm p-6 shadow-card">
          <h1 className="mb-1 text-center text-xl font-semibold text-neutral-900">
            Manager Access
          </h1>
          <p className="mb-6 text-center text-sm text-neutral-600">
            Enter the manager password to continue.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1"
              />
            </div>
            {loginError && (
              <p className="text-sm text-error">{loginError}</p>
            )}
            <Button type="submit" className="w-full min-h-touch">
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-neutral-50 p-4 pb-24 md:pb-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Staff Performance — {periodLabel}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Task completion by staff for the selected date range.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-40"
            />
          </div>
          <Button variant="outline" onClick={loadData} disabled={loading} className="min-h-touch">
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Staff", value: String(kpis.totalStaff) },
          { label: "Avg %", value: `${kpis.avgPct}%` },
          { label: "Total Hours", value: `${kpis.totalHours}h` },
          { label: "Stores Cleaned", value: String(kpis.storesCleaned) },
        ].map((kpi) => (
          <Card key={kpi.label} className="rounded-2xl p-4 text-center shadow-card">
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search staff…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0} className="min-h-touch">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {loading && (
        <p className="py-12 text-center text-neutral-600">Loading…</p>
      )}
      {error && (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="py-12 text-center text-neutral-600">No staff data for this range.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="rounded-2xl bg-white p-6 text-center shadow-card"
            >
              <p className="font-semibold text-neutral-900">{s.name}</p>
              <div className="relative mx-auto my-4 flex h-[120px] w-[120px] items-center justify-center">
                <SegmentedRing percent={s.percentage} />
                <span className="absolute text-3xl font-bold text-slate-800">
                  {s.percentage}%
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {s.days} days • {s.hours}h
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
