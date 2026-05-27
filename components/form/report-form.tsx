"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type SignatureCanvas from "react-signature-canvas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OfflineBanner } from "@/components/form/offline-banner";
import { SupervisorConfirmation } from "@/components/form/supervisor-confirmation";
import { reportSchema, type ReportFormValues } from "@/lib/validations/report";
import { createClient } from "@/lib/supabase";
import { calcElapsedMinutes, todayInTZ } from "@/lib/timezone";
import { submitReport } from "@/lib/report-submit";
import { queueReport, getPending, removePending } from "@/lib/offline-queue";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { printReport } from "@/lib/print-report";
import { TASK_FIELDS, type Staff, type Store, type Shift } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHIFTS: Shift[] = ["Morning", "Afternoon", "Night"];

const defaultValues: ReportFormValues = {
  staff_id: "",
  store_id: "",
  date: todayInTZ(),
  shift: "Morning",
  time_in: "08:00",
  time_out: "16:00",
  dry_mop: false,
  wet_mop: false,
  carton_collection: false,
  trash_disposal: false,
  vacuum_cleaning: false,
  roof_cleaning: false,
  general_assistance: false,
  emergency_assistance: false,
  remarks: "",
  supervisor_name: "",
  supervisor_employee_id: "",
  supervisor_signature: "",
  supervisor_notes: "",
};

export function ReportForm() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<(ReportFormValues & { time_elapsed_minutes: number }) | null>(null);
  const [storeSearch, setStoreSearch] = useState("");
  const signatureRef = useRef<SignatureCanvas>(null);
  const isOnline = useOnlineStatus();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues,
  });

  const timeIn = watch("time_in");
  const timeOut = watch("time_out");
  const date = watch("date");
  const shift = watch("shift");

  const elapsed = useMemo(() => {
    if (!timeIn || !timeOut || !date) return 0;
    try {
      return calcElapsedMinutes(timeIn, timeOut, date);
    } catch {
      return 0;
    }
  }, [timeIn, timeOut, date]);

  const filteredStores = useMemo(() => {
    const q = storeSearch.toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => s.name.toLowerCase().includes(q));
  }, [stores, storeSearch]);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      try {
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("id,name")
          .order("name");

        const { data: storesData, error: storesError } = await supabase
          .from("stores")
          .select("id,name")
          .order("name");

        // Debug logs (requested)
        console.log("STAFF FETCH:", staffData, "ERROR:", staffError);
        console.log("STORES FETCH:", storesData, "ERROR:", storesError);

        if (staffError) {
          toast.error(`Staff load failed: ${staffError.message}`);
        } else {
          const normalizedStaff = (staffData ?? []).map((s) => ({
            ...s,
            employee_id: "",
          }));
          setStaff(normalizedStaff);
        }

        if (storesError) {
          toast.error(`Stores load failed: ${storesError.message}`);
        } else {
          setStores(storesData ?? []);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        toast.error(`Load failed: ${msg}`);
        console.log("LOAD ERROR:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const syncPending = useCallback(async () => {
    const pending = getPending();
    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        await submitReport(item);
        removePending(item._localId);
      } catch {
        break;
      }
    }
    if (getPending().length === 0) {
      toast.success("Offline reports synced");
    }
  }, []);

  useEffect(() => {
    if (isOnline) syncPending();
  }, [isOnline, syncPending]);

  const captureSignatureForSubmit = (): boolean => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setValue("supervisor_signature", "", { shouldValidate: true });
      toast.error("Supervisor signature is required");
      return false;
    }
    setValue("supervisor_signature", signatureRef.current.toDataURL("image/png"), {
      shouldValidate: true,
    });
    return true;
  };

  const onSubmit = async (values: ReportFormValues) => {
    if (!captureSignatureForSubmit()) return;

    setSubmitting(true);
    const elapsedMin = calcElapsedMinutes(values.time_in, values.time_out, values.date);
    const signature = signatureRef.current?.toDataURL("image/png") ?? values.supervisor_signature;
    const submitValues: ReportFormValues = {
      ...values,
      supervisor_signature: signature,
      supervisor_employee_id: values.supervisor_employee_id.toUpperCase(),
    };

    try {
      if (!isOnline) {
        queueReport({ ...submitValues, time_elapsed_minutes: elapsedMin });
        setLastSubmitted({ ...submitValues, time_elapsed_minutes: elapsedMin });
        setSuccessOpen(true);
        toast.info("Saved offline — will sync when online");
        return;
      }

      const result = await submitReport(submitValues);
      if (!result) return;

      setLastSubmitted({ ...submitValues, time_elapsed_minutes: elapsedMin });
      setSuccessOpen(true);
      toast.success("Report submitted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit";
      if (!isOnline || !navigator.onLine) {
        queueReport({ ...submitValues, time_elapsed_minutes: elapsedMin });
        setLastSubmitted({ ...submitValues, time_elapsed_minutes: elapsedMin });
        setSuccessOpen(true);
        toast.info("Saved offline — will sync when online");
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => {
    reset({ ...defaultValues, date: todayInTZ() });
    signatureRef.current?.clear();
    setSuccessOpen(false);
    setLastSubmitted(null);
  };

  const handlePrint = () => {
    if (!lastSubmitted) return;
    const staffMember = staff.find((s) => s.id === lastSubmitted.staff_id);
    const store = stores.find((s) => s.id === lastSubmitted.store_id);
    printReport({ ...lastSubmitted, staff: staffMember, store });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-11 rounded-md bg-neutral-100" />
        ))}
      </div>
    );
  }

  return (
    <>
      <OfflineBanner />
      <form onSubmit={handleSubmit(onSubmit)} className="pb-32 md:pb-8">
        <div className="mx-auto max-w-4xl space-y-5 p-4">
          {/* Staff */}
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select value={watch("staff_id")} onValueChange={(v) => setValue("staff_id", v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staff_id && <p className="text-sm text-error">{errors.staff_id.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" className="text-lg" {...register("date")} />
            {errors.date && <p className="text-sm text-error">{errors.date.message}</p>}
          </div>

          {/* Shift */}
          <div className="space-y-2">
            <Label>Shift</Label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("shift", s, { shouldValidate: true })}
                  className={cn(
                    "min-h-touch rounded-lg border-2 px-2 py-3 text-base font-medium transition-colors",
                    shift === s
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-neutral-200 bg-surface hover:bg-neutral-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Store searchable */}
          <div className="space-y-2">
            <Label>Store</Label>
            <Input
              type="search"
              placeholder="Search store by name..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              className="mb-2"
            />
            <Select value={watch("store_id")} onValueChange={(v) => setValue("store_id", v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {filteredStores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.store_id && <p className="text-sm text-error">{errors.store_id.message}</p>}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_in">Time In</Label>
              <Input id="time_in" type="time" className="text-2xl font-semibold h-14" {...register("time_in")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_out">Time Out</Label>
              <Input id="time_out" type="time" className="text-2xl font-semibold h-14" {...register("time_out")} />
            </div>
          </div>
          {errors.time_out && <p className="text-sm text-error">{errors.time_out.message}</p>}
          <p className="text-center text-lg font-medium text-primary-600">
            Time elapsed: {elapsed} minutes
          </p>

          {/* Tasks */}
          <div className="space-y-2">
            <Label>Tasks Completed</Label>
            <div className="grid grid-cols-2 gap-3">
              {TASK_FIELDS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex min-h-touch cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                >
                  <Checkbox
                    checked={watch(key)}
                    onCheckedChange={(checked) => setValue(key, !!checked)}
                  />
                  <span className="text-base leading-tight">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" rows={4} placeholder="Optional notes..." {...register("remarks")} />
          </div>

          <SupervisorConfirmation
            register={register}
            errors={errors}
            setValue={setValue}
            signatureRef={signatureRef}
          />
        </div>

        {/* Fixed submit */}
        <div className="fixed bottom-14 inset-x-0 z-30 border-t border-neutral-200 bg-surface/95 p-4 backdrop-blur md:static md:mx-auto md:mt-4 md:max-w-4xl md:border-0">
          <Button type="submit" className="w-full h-12 text-lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </form>

      <Sheet open={successOpen} onOpenChange={setSuccessOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="text-center text-2xl text-primary-600">Submitted!</SheetTitle>
            <SheetDescription className="text-center">
              Your housekeeping report has been saved successfully.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex-col gap-3 mt-6 sm:flex-col">
            <Button className="w-full min-h-touch" onClick={handlePrint}>
              <Printer className="mr-2 h-5 w-5" />
              Print PDF
            </Button>
            <Button variant="outline" className="w-full min-h-touch" onClick={handleNewReport}>
              <Plus className="mr-2 h-5 w-5" />
              New Report
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
