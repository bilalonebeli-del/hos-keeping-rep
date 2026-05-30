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

type StaffRow = { id: string; name: string };
type StoreRow = { id: string; name: string };
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
};

type FlatReport = {
  id: string;
  staff_name: string;
  store: string;
  date: string;
  hours_worked: number;
  rating: number;
};

type StaffTableRow = {
  name: string;
  daysWorked: number;
  totalHours: number;
  storesWorked: number;
  avgRating: string;
  performance: number;
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

function reportRating(r: ReportRow) {
  return (taskDone(r) / 5) * 100;
}

function performanceBadgeClass(performance: number) {
  if (performance > 80) return "bg-teal-100 text-teal-800";
  if (performance >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function flattenReports(
  rows: ReportRow[],
  staffMap: Record<string, string>,
  storeMap: Record<string, string>
): FlatReport[] {
  return rows.map((r) => ({
    id: r.id,
    staff_name: staffMap[r.staff_id] || "Unknown",
    store: storeMap[r.store_id] || "Unknown",
    date: r.date,
    hours_worked: (r.time_elapsed_minutes || 0) / 60,
    rating: reportRating(r),
  }));
}

function buildStaffStats(filtered: FlatReport[]): StaffTableRow[] {
  const acc: Record<
    string,
    {
      name: string;
      days: Set<string>;
      hours: number;
      stores: Set<string>;
      ratings: number[];
    }
  > = {};

  for (const r of filtered) {
    if (!acc[r.staff_name]) {
      acc[r.staff_name] = {
        name: r.staff_name,
        days: new Set(),
        hours: 0,
        stores: new Set(),
        ratings: [],
      };
    }
    acc[r.staff_name].days.add(r.date);
    acc[r.staff_name].hours += r.hours_worked;
    acc[r.staff_name].stores.add(r.store);
    acc[r.staff_name].ratings.push(r.rating);
  }

  return Object.values(acc)
    .map((s) => {
      const daysWorked = s.days.size;
      const totalHours = Math.round(s.hours * 10) / 10;
      const performance =
        daysWorked > 0
          ? Math.round((totalHours / (daysWorked * 8)) * 100)
          : 0;
      const avgRating = s.ratings.length
        ? (s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length).toFixed(1)
        : "-";

      return {
        name: s.name,
        daysWorked,
        totalHours,
        storesWorked: s.stores.size,
        avgRating,
        performance,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function downloadCsv(rows: StaffTableRow[], filename: string) {
  if (rows.length === 0) return;
  const header =
    "staff_name,days_worked,total_hours,stores_worked,avg_rating,performance";
  const body = rows
    .map(
      (s) =>
        `"${s.name.replace(/"/g, '""')}",${s.daysWorked},${s.totalHours},${s.storesWorked},${s.avgRating},${s.performance}%`
    )
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
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [rangeStart, setRangeStart] = useState(defaults.start);
  const [rangeEnd, setRangeEnd] = useState(defaults.end);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<FlatReport[]>([]);
  const [selectedStore, setSelectedStore] = useState("All Stores");

  useEffect(() => {
    const session = localStorage.getItem("manager_session");
    if (session) {
      try {
        const { time } = JSON.parse(session) as { time: number };
        const twoHours = 2 * 60 * 60 * 1000;
        if (Date.now() - time < twoHours) {
          setOk(true);
        } else {
          localStorage.removeItem("manager_session");
        }
      } catch {
        localStorage.removeItem("manager_session");
      }
    }
  }, []);

  const handleLogin = () => {
    if (pw === MANAGER_PASSWORD) {
      localStorage.setItem("manager_session", JSON.stringify({ time: Date.now() }));
      localStorage.removeItem("mgr");
      setOk(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("manager_session");
    setOk(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [staffRes, storesRes, reportsRes] = await Promise.all([
        supabase.from("staff").select("id, name"),
        supabase.from("stores").select("id, name"),
        supabase
          .from("reports")
          .select(
            "id, staff_id, store_id, date, time_elapsed_minutes, dry_mop, wet_mop, vacuum_cleaning, trash_disposal, roof_cleaning"
          )
          .gte("date", rangeStart)
          .lte("date", rangeEnd),
      ]);

      if (staffRes.error) throw staffRes.error;
      if (storesRes.error) throw storesRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const staffMap: Record<string, string> = {};
      (staffRes.data as StaffRow[] | null)?.forEach((s) => {
        staffMap[s.id] = s.name;
      });

      const storeMap: Record<string, string> = {};
      (storesRes.data as StoreRow[] | null)?.forEach((s) => {
        storeMap[s.id] = s.name;
      });

      setReports(
        flattenReports((reportsRes.data as ReportRow[] | null) ?? [], staffMap, storeMap)
      );
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (ok) loadData();
  }, [ok, loadData]);

  const stores = useMemo(() => {
    const unique = Array.from(new Set(reports.map((r) => r.store))).sort();
    return ["All Stores", ...unique];
  }, [reports]);

  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Stores": reports.length };
    for (const r of reports) {
      counts[r.store] = (counts[r.store] || 0) + 1;
    }
    return counts;
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (selectedStore === "All Stores") return reports;
    return reports.filter((r) => r.store === selectedStore);
  }, [reports, selectedStore]);

  const staffStats = useMemo(
    () => buildStaffStats(filteredReports),
    [filteredReports]
  );

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staffStats;
    return staffStats.filter((s) => s.name.toLowerCase().includes(q));
  }, [staffStats, search]);

  const kpis = useMemo(() => {
    const totalStaff = staffStats.length;
    const avgPct =
      totalStaff > 0
        ? Math.round(
            staffStats.reduce((sum, s) => sum + s.performance, 0) / totalStaff
          )
        : 0;
    const totalHours =
      Math.round(staffStats.reduce((sum, s) => sum + s.totalHours, 0) * 10) / 10;
    const storesCleaned = new Set(filteredReports.map((r) => r.store)).size;
    return { totalStaff, avgPct, totalHours, storesCleaned };
  }, [staffStats, filteredReports]);

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

  const tableTitle =
    selectedStore === "All Stores"
      ? "Staff analytics"
      : `Staff who worked at ${selectedStore}`;

  if (!ok) {
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
              if (e.key === "Enter") handleLogin();
            }}
          />
          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-lg bg-[#0d9488] px-4 py-2 font-medium text-white hover:bg-[#0f766e]"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Staff Analytics — {periodLabel}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Complete performance by store</p>
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
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Mobile store filter */}
        <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
          <label className="mb-1 block text-sm font-medium text-slate-700">Store</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {stores.map((store) => (
              <option key={store} value={store}>
                {store} ({storeCounts[store] ?? 0})
              </option>
            ))}
          </select>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 max-h-screen overflow-y-auto p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stores
            </h2>
            <ul className="space-y-1">
              {stores.map((store) => {
                const active = selectedStore === store;
                return (
                  <li key={store}>
                    <button
                      type="button"
                      onClick={() => setSelectedStore(store)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-[#0d9488] font-medium text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate pr-2">{store}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {storeCounts[store] ?? 0}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Staff", value: String(kpis.totalStaff) },
              { label: "Avg %", value: `${kpis.avgPct}%` },
              { label: "Total Hours", value: `${kpis.totalHours}h` },
              { label: "Stores Cleaned", value: String(kpis.storesCleaned) },
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

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                downloadCsv(
                  filteredStaff,
                  `staff-analytics-${selectedStore.replace(/\s+/g, "-")}-${rangeStart}-${rangeEnd}.csv`
                )
              }
              disabled={filteredStaff.length === 0}
              className="rounded-lg bg-[#0d9488] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e] disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>

          {loading && <p className="py-12 text-center text-slate-500">Loading…</p>}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-semibold text-slate-900">{tableTitle}</h2>
            </div>
            {!loading && !error && filteredStaff.length === 0 && (
              <p className="px-4 py-12 text-center text-slate-500">No staff data for this view.</p>
            )}
            {filteredStaff.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700">Staff Name</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Days Worked</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Total Hours</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Stores Worked</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Avg Rating</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((s) => (
                      <tr
                        key={s.name}
                        className="border-b border-slate-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                        <td className="px-4 py-3 text-slate-600">{s.daysWorked}</td>
                        <td className="px-4 py-3 text-slate-600">{s.totalHours}h</td>
                        <td className="px-4 py-3 text-slate-600">{s.storesWorked}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {s.avgRating === "-" ? "-" : `${s.avgRating}%`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${performanceBadgeClass(s.performance)}`}
                          >
                            {s.performance}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
