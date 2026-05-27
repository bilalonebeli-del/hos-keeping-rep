"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Eraser } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ReportFormValues } from "@/lib/validations/report";

type Props = {
  register: UseFormRegister<ReportFormValues>;
  errors: FieldErrors<ReportFormValues>;
  setValue: UseFormSetValue<ReportFormValues>;
  signatureRef: React.MutableRefObject<SignatureCanvas | null>;
};

export function SupervisorConfirmation({ register, errors, setValue, signatureRef }: Props) {
  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setValue("supervisor_signature", "", { shouldValidate: true });
  };

  const captureSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setValue("supervisor_signature", signatureRef.current.toDataURL("image/png"), {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-primary-100 bg-primary-50 p-4 shadow-card">
      <h3 className="text-lg font-semibold text-primary-700">Supervisor Confirmation</h3>

      <div className="space-y-2">
        <Label htmlFor="supervisor_name">Supervisor Name</Label>
        <Input
          id="supervisor_name"
          placeholder="Full name"
          className="min-h-touch"
          {...register("supervisor_name")}
        />
        {errors.supervisor_name && (
          <p className="text-sm text-error">{errors.supervisor_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supervisor_employee_id">LTR No</Label>
        <Input
          id="supervisor_employee_id"
          placeholder="LTR-xxxx"
          className="min-h-touch uppercase"
          {...register("supervisor_employee_id")}
        />
        {errors.supervisor_employee_id && (
          <p className="text-sm text-error">{errors.supervisor_employee_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Supervisor Signature</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearSignature}
            className="min-h-touch"
          >
            <Eraser className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-surface">
          <SignatureCanvas
            ref={signatureRef}
            onEnd={captureSignature}
            canvasProps={{
              className: "h-40 w-full touch-none",
              "aria-label": "Supervisor signature pad",
            }}
            penColor="#0d9488"
            backgroundColor="#ffffff"
          />
        </div>
        {errors.supervisor_signature && (
          <p className="text-sm text-error">{errors.supervisor_signature.message}</p>
        )}
        <p className="text-xs text-neutral-600">Sign with finger or stylus</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supervisor_notes">Supervisor Notes</Label>
        <Textarea
          id="supervisor_notes"
          rows={3}
          placeholder="Optional supervisor notes..."
          {...register("supervisor_notes")}
        />
      </div>
    </div>
  );
}
