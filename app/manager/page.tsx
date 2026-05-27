import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase-server";
import { computeStaffAttendance } from "@/lib/manager-attendance";
import { ManagerAttendanceView } from "@/components/manager/manager-attendance-view";

type PageProps = {
  searchParams: { month?: string };
};

export default async function ManagerPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const month = searchParams.month ?? format(new Date(), "yyyy-MM");
  const from = format(startOfMonth(new Date(`${month}-01`)), "yyyy-MM-dd");
  const to = format(endOfMonth(new Date(`${month}-01`)), "yyyy-MM-dd");

  const [staffRes, reportsRes] = await Promise.all([
    supabase.from("staff").select("id, name").order("name"),
    supabase.from("reports").select("staff_id, date").gte("date", from).lte("date", to),
  ]);

  if (staffRes.error) throw staffRes.error;
  if (reportsRes.error) throw reportsRes.error;

  const stats = computeStaffAttendance(
    staffRes.data ?? [],
    reportsRes.data ?? [],
    from,
    to
  );

  return <ManagerAttendanceView month={month} stats={stats} />;
}
