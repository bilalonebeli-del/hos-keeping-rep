// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MANAGER_PASSWORD = "manager2026";
const TEAL = "#0d9488";
const PIE_COLORS = [
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#99f6e4",
  "#0f766e",
  "#115e59",
  "#134e4a",
];

type MatrixRow = {
  staff_name: string;
  store_name: string;
  reports: number;
  dry_mop: number;
  wet_mop: number;
  carton: number;
  trash: number;
  vacuum: number;
  roof: number;
  general: number;
  emergency: number;
};

type ReportTaskRow = {
  staff_id: string;
  store_id: string;
  date: string;
  dry_mop: boolean | null;
  wet_mop: boolean | null;
  carton_collection: boolean | null;
  trash_disposal: boolean | null;
  vacuum_cleaning: boolean | null;
  roof_cleaning: boolean | null;
  general_assistance: boolean | null;
  emergency_assistance: boolean | null;
};

type SortKey = keyof MatrixRow;
type SortDir = "asc" | "desc";

const TASK_COLUMNS: { key: keyof MatrixRow; label: string }[] = [
  { key: "dry_mop", label: "Dry" },
  { key: "wet_mop", label: "Wet" },
  { key: "carton", label: "Carton" },
  { key: "trash", label: "Trash" },
  { key: "vacuum", label: "Vacuum" },
  { key: "roof", label: "Roof" },
  { key: "general", label: "General" },
  { key: "emergency", label: "Emergency" },
];

function monthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const last = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end };
}

function emptyRow(staff_name: string, store_name: string): MatrixRow {
  return {
    staff_name,
    store_name,
    reports: 0,
    dry_mop: 0,
    wet_mop: 0,
    carton: 0,
    trash: 0,
    vacuum: 0,
    roof: 0,
    general: 0,
    emergency: 0,
  };
}

function rowTotalTasks(row: MatrixRow) {
  return (
    row.dry_mop +
    row.wet_mop +
    row.carton +
    row.trash +
    row.vacuum +
    row.roof +
    row.general +
    row.emergency
  );
}

function heatmapClass(value: number) {
  if (value === 0) return "bg-[#f3f4f6] text-slate-600";
  if (value <= 2) return "bg-[#99f6e4] text-slate-800";
  return "bg-[#0d9488] text-white";
}

function normalizeMatrixRow(row: Partial<MatrixRow>): MatrixRow {
  return {
    staff_name: String(row.staff_name ?? ""),
    store_name: String(row.store_name ?? ""),
    reports: Number(row.reports ?? 0),
    dry_mop: Number(row.dry_mop ?? 0),
    wet_mop: Number(row.wet_mop ?? 0),
    carton: Number(row.carton ?? 0),
    trash: Number(row.trash ?? 0),
    vacuum: Number(row.vacuum ?? 0),
    roof: Number(row.roof ?? 0),
    general: Number(row.general ?? 0),
    emergency: Number(row.emergency ?? 0),
  };
}

function aggregateReports(
  reports: ReportTaskRow[],
  staffMap: Record<string, string>,
  storeMap: Record<string, string>
) {
  const acc = new Map<string, MatrixRow>();

  for (const r of reports) {
    const staff_name = staffMap[r.staff_id] ?? "Unknown";
    const store_name = storeMap[r.store_id] ?? "Unknown";
    const key = `${staff_name}::${store_name}`;
    const row = acc.get(key) ?? emptyRow(staff_name, store_name);

    row.reports += 1;
    if (r.dry_mop) row.dry_mop += 1;
    if (r.wet_mop) row.wet_mop += 1;
    if (r.carton_collection) row.carton += 1;
    if (r.trash_disposal) row.trash += 1;
    if (r.vacuum_cleaning) row.vacuum += 1;
    if (r.roof_cleaning) row.roof += 1;
    if (r.general_assistance) row.general += 1;
    if (r.emergency_assistance) row.emergency += 1;

    acc.set(key, row);
  }

  return acc;
}

function buildFullMatrix(
  staffNames: string[],
  storeNames: string[],
  aggregated: Map<string, MatrixRow>
): MatrixRow[] {
  const rows: MatrixRow[] = [];
  for (const staff_name of staffNames) {
    for (const store_name of storeNames) {
      rows.push(
        aggregated.get(`${staff_name}::${store_name}`) ?? emptyRow(staff_name, store_name)
      );
    }
  }
  return rows;
}

function downloadCsv(rows: MatrixRow[], filename: string) {
  if (rows.length === 0) return;
  const header =
    "staff_name,store_name,reports,dry_mop,wet_mop,carton,trash,vacuum,roof,general,emergency";
  const body = rows
    .map((r) =>
      [
        `"${r.staff_name.replace(/"/g, '""')}"`,
        `"${r.store_name.replace(/"/g, '""')}"`,
        r.reports,
        r.dry_mop,
        r.wet_mop,
        r.carton,
        r.trash,
        r.vacuum,
        r.roof,
        r.general,
        r.emergency,
      ].join(",")
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
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [staffNames, setStaffNames] = useState<string[]>([]);
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [sortKey, setSortKey] = useState<SortKey>("staff_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
      const [staffRes, storesRes, reportsRes, matrixRes] = await Promise.all([
        supabase.from("staff").select("id, name").order("name"),
        supabase.from("stores").select("id, name").order("name"),
        supabase
          .from("reports")
          .select(
            "staff_id, store_id, date, dry_mop, wet_mop, carton_collection, trash_disposal, vacuum_cleaning, roof_cleaning, general_assistance, emergency_assistance"
          )
          .gte("date", rangeStart)
          .lte("date", rangeEnd),
        supabase.from("manager_task_matrix").select("*"),
      ]);

      if (staffRes.error) throw staffRes.error;
      if (storesRes.error) throw storesRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const staffMap: Record<string, string> = {};
      const allStaff =
        (staffRes.data ?? []).map((s) => {
          staffMap[s.id] = s.name;
          return s.name as string;
        }) ?? [];

      const storeMap: Record<string, string> = {};
      const allStores =
        (storesRes.data ?? []).map((s) => {
          storeMap[s.id] = s.name;
          return s.name as string;
        }) ?? [];

      setStaffNames(allStaff);
      setStoreNames(allStores);

      let aggregated: Map<string, MatrixRow>;

      if ((reportsRes.data ?? []).length > 0) {
        aggregated = aggregateReports(
          (reportsRes.data as ReportTaskRow[]) ?? [],
          staffMap,
          storeMap
        );
      } else if (!matrixRes.error && (matrixRes.data ?? []).length > 0) {
        aggregated = new Map(
          (matrixRes.data as Partial<MatrixRow>[]).map((row) => {
            const normalized = normalizeMatrixRow(row);
            return [`${normalized.staff_name}::${normalized.store_name}`, normalized] as const;
          })
        );
      } else {
        aggregated = new Map();
        if (matrixRes.error) {
          console.warn("manager_task_matrix view unavailable:", matrixRes.error.message);
        }
      }

      setMatrix(buildFullMatrix(allStaff, allStores, aggregated));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      setError(msg);
      setMatrix([]);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (ok) loadData();
  }, [ok, loadData]);

  const stores = useMemo(() => ["All Stores", ...storeNames], [storeNames]);

  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Stores": 0 };
    for (const row of matrix) {
      if (row.reports > 0) {
        counts["All Stores"] = (counts["All Stores"] ?? 0) + row.reports;
        counts[row.store_name] = (counts[row.store_name] ?? 0) + row.reports;
      }
    }
    return counts;
  }, [matrix]);

  const filteredMatrix = useMemo(() => {
    let rows = matrix;

    if (selectedStore !== "All Stores") {
      rows = rows.filter((r) => r.store_name === selectedStore);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => r.staff_name.toLowerCase().includes(q));
    }

    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [matrix, selectedStore, search, sortKey, sortDir]);

  const kpis = useMemo(() => {
    const rows =
      selectedStore === "All Stores"
        ? matrix
        : matrix.filter((r) => r.store_name === selectedStore);

    const totalReports = rows.reduce((sum, r) => sum + r.reports, 0);
    const totalTasks = rows.reduce((sum, r) => sum + rowTotalTasks(r), 0);
    const activeStaff = new Set(rows.filter((r) => r.reports > 0).map((r) => r.staff_name)).size;
    const activeStores = new Set(rows.filter((r) => r.reports > 0).map((r) => r.store_name)).size;

    return { totalReports, totalTasks, activeStaff, activeStores };
  }, [matrix, selectedStore]);

  const barChartData = useMemo(() => {
    const byStaff = new Map<string, number>();
    for (const row of filteredMatrix) {
      byStaff.set(row.staff_name, (byStaff.get(row.staff_name) ?? 0) + rowTotalTasks(row));
    }
    return Array.from(byStaff.entries())
      .map(([name, tasks]) => ({ name: name.split(" ")[0], fullName: name, tasks }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 8);
  }, [filteredMatrix]);

  const pieChartData = useMemo(() => {
    const totals = {
      Dry: 0,
      Wet: 0,
      Carton: 0,
      Trash: 0,
      Vacuum: 0,
      Roof: 0,
      General: 0,
      Emergency: 0,
    };
    for (const row of filteredMatrix) {
      totals.Dry += row.dry_mop;
      totals.Wet += row.wet_mop;
      totals.Carton += row.carton;
      totals.Trash += row.trash;
      totals.Vacuum += row.vacuum;
      totals.Roof += row.roof;
      totals.General += row.general;
      totals.Emergency += row.emergency;
    }
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [filteredMatrix]);

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
      ? "Task Completion Matrix"
      : `Task matrix — ${selectedStore}`;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

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
              Task Completion Matrix — {periodLabel}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Staff × store task counts ({staffNames.length} staff, {storeNames.length} stores)
            </p>
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

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Reports", value: String(kpis.totalReports) },
              { label: "Tasks Completed", value: String(kpis.totalTasks) },
              { label: "Active Staff", value: String(kpis.activeStaff) },
              { label: "Active Stores", value: String(kpis.activeStores) },
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

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Top staff by total tasks
              </h3>
              <div className="h-56 w-full">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [value, "Tasks"]}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName ?? ""
                        }
                      />
                      <Bar dataKey="tasks" fill={TEAL} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-slate-400">
                    No task data for this view
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Task mix</h3>
              <div className="h-56 w-full">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={72}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-slate-400">
                    No task data for this view
                  </p>
                )}
              </div>
            </div>
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
                  filteredMatrix,
                  `task-matrix-${selectedStore.replace(/\s+/g, "-")}-${rangeStart}-${rangeEnd}.csv`
                )
              }
              disabled={filteredMatrix.length === 0}
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
              <p className="mt-1 text-xs text-slate-500">
                {filteredMatrix.length} rows · click column headers to sort
              </p>
            </div>
            {!loading && !error && filteredMatrix.length === 0 && (
              <p className="px-4 py-12 text-center text-slate-500">No matrix data for this view.</p>
            )}
            {filteredMatrix.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {(
                        [
                          { key: "staff_name" as SortKey, label: "Staff" },
                          { key: "store_name" as SortKey, label: "Store" },
                          { key: "reports" as SortKey, label: "Reports" },
                          ...TASK_COLUMNS,
                        ] as { key: SortKey; label: string }[]
                      ).map((col) => (
                        <th
                          key={col.key}
                          className={`cursor-pointer select-none px-3 py-3 font-semibold text-slate-700 hover:bg-slate-100 ${
                            col.key === "staff_name"
                              ? "sticky left-0 z-10 bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                              : ""
                          }`}
                          onClick={() => toggleSort(col.key)}
                        >
                          {col.label}
                          {sortIndicator(col.key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrix.map((row) => (
                      <tr
                        key={`${row.staff_name}-${row.store_name}`}
                        className="border-b border-slate-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-900 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                          {row.staff_name}
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-2 text-slate-600">
                          {row.store_name}
                        </td>
                        <td
                          className={`px-3 py-2 text-center font-medium ${heatmapClass(row.reports)}`}
                        >
                          {row.reports}
                        </td>
                        {TASK_COLUMNS.map((col) => {
                          const val = row[col.key] as number;
                          return (
                            <td
                              key={col.key}
                              className={`px-3 py-2 text-center font-medium ${heatmapClass(val)}`}
                            >
                              {val}
                            </td>
                          );
                        })}
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
