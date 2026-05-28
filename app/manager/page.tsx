// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MANAGER_PASSWORD = "manager2026";
const SEGMENTS = 12;
const RING_SIZE = 120;
const STROKE = 10;
const GAP_DEG = 3;

type StaffRow = { id: string; name: string };
type ReportRow = {
  staff_id: string;
  store_id: string;
  time_elapsed_minutes: number;
  dry_mop: boolean;
  wet_mop: boolean;
  vacuum_cleaning: boolean;
  trash_disposal: boolean;
  roof_cleaning: boolean;
};

type StaffStat = {
  id: string;
  name: string;
  days: number;
  done: number;
  percentage: number;
  hours: number;
};

function monthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const last = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end };
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

function buildStats(reports: ReportRow[], staffMap: Record<string, string>): StaffStat[] {
  const byStaff: Record<string, { days: number; minutes: number; done: number }> = {};

  for (const r of reports) {
    if (!byStaff[r.staff_id]) {
      byStaff[r.staff_id] = { days: 0, minutes: 0, done: 0 };
    }
    byStaff[r.staff_id].days += 1;
    byStaff[r.staff_id].minutes += r.time_elapsed_minutes || 0;
    byStaff[r.staff_id].done += taskDone(r);
  }

  const rows: StaffStat[] = [];
  for (const id of Object.keys(byStaff)) {
    const s = byStaff[id];
    const tasksPossible = s.days * 5;
    const percentage = tasksPossible > 0 ? Math.round((s.done / tasksPossible) * 100) : 0;
    const hours = Math.round((s.minutes / 60) * 10) / 10;
    rows.push({
      id,
      name: staffMap[id] || "Unknown",
      days: s.days,
      done: s.done,
      percentage,
      hours,
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

function downloadCsv(rows: StaffStat[], filename: string) {
  if (rows.length === 0) return;
  const header = "name,percentage,days,hours";
  const body = rows
    .map((s) => `"${s.name.replace(/"/g, '""')}",${s.percentage},${s.days},${s.hours}`)
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManagerPage() {
  const defaults = monthRange();
  const [logged, setLogged] = useState(false);
  const [pw, setPw] = useState("");
  const [rangeStart, setRangeStart] = useState(defaults.start);
  const [rangeEnd, setRangeEnd] = useState(defaults.end);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<StaffStat[]>([]);
  const [storesCleaned, setStoresCleaned] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("mgr") === "1") setLogged(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const staffRes = await supabase.from("staff").select("id, name");
      if (staffRes.error) throw staffRes.error;

      const reportsRes = await supabase
        .from("reports")
        .select(
          "staff_id, store_id, time_elapsed_minutes, dry_mop, wet_mop, vacuum_cleaning, trash_disposal, roof_cleaning"
        )
        .gte("date", rangeStart)
        .lte("date", rangeEnd);

      if (reportsRes.error) throw reportsRes.error;

      const staffMap: Record<string, string> = {};
      (staffRes.data as StaffRow[] | null)?.forEach((s) => {
        staffMap[s.id] = s.name;
      });

      const reports = (reportsRes.data as ReportRow[] | null) ?? [];
      setStats(buildStats(reports, staffMap));
      setStoresCleaned(new Set(reports.map((r) => r.store_id)).size);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
      setStats([]);
      setStoresCleaned(0);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (logged) loadData();
  }, [logged, loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((s) => s.name.toLowerCase().includes(q));
  }, [stats, search]);

  const kpis = useMemo(() => {
    const totalStaff = stats.length;
    const avgPct =
      totalStaff > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.percentage, 0) / totalStaff)
        : 0;
    const totalHours = Math.round(stats.reduce((sum, s) => sum + s.hours, 0) * 10) / 10;
    return { totalStaff, avgPct, totalHours };
  }, [stats]);

  const periodLabel = useMemo(() => {
    const [y, m] = rangeStart.split("-");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const mi = Number(m) - 1;
    return mi >= 0 && mi < 12 ? `${months[mi]} ${y}` : `${rangeStart} – ${rangeEnd}`;
  }, [rangeStart, rangeEnd]);

  if (!logged) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-2 text-center text-xl font-bold text-slate-900">Manager Login</h2>
          <p className="mb-6 text-center text-sm text-slate-500">Housekeeping Reports</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && pw === MANAGER_PASSWORD) {
                localStorage.setItem("mgr", "1");
                setLogged(true);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (pw === MANAGER_PASSWORD) {
                localStorage.setItem("mgr", "1");
                setLogged(true);
              }
            }}
            className="w-full rounded-lg bg-[#0d9488] px-4 py-2 font-medium text-white hover:bg-[#0f766e]"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Staff Performance — {periodLabel}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Task completion by staff</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-slate-600">
              Start
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 px-2 py-1"
              />
            </label>
            <label className="text-sm text-slate-600">
              End
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 px-2 py-1"
              />
            </label>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Staff", value: String(kpis.totalStaff) },
            { label: "Avg %", value: `${kpis.avgPct}%` },
            { label: "Total Hours", value: `${kpis.totalHours}h` },
            { label: "Stores Cleaned", value: String(storesCleaned) },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white p-4 text-center shadow-sm"
            >
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Search staff…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 sm:flex-1"
          />
          <button
            type="button"
            onClick={() =>
              downloadCsv(filtered, `staff-performance-${rangeStart}-${rangeEnd}.csv`)
            }
            disabled={filtered.length === 0}
            className="rounded-lg bg-[#0d9488] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e] disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        {loading && <p className="py-12 text-center text-slate-500">Loading…</p>}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="py-12 text-center text-slate-500">No staff data for this range.</p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <p className="font-semibold text-slate-900">{s.name}</p>
              <div className="relative mx-auto my-4 h-[120px] w-[120px]">
                <SegmentedRing percent={s.percentage} />
                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-800">
                  {s.percentage}%
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {s.days} days • {s.hours}h
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
