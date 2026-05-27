"use client";

import { cn } from "@/lib/utils";

type SplashScreenProps = {
  visible: boolean;
  exiting: boolean;
  buttonEnabled: boolean;
  buttonPulse: boolean;
  onStart: () => void;
};

export function SplashScreen({
  visible,
  exiting,
  buttonEnabled,
  buttonPulse,
  onStart,
}: SplashScreenProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-white px-6",
        "transition-opacity duration-300 ease-out",
        exiting ? "opacity-0 pointer-events-none" : "opacity-100",
        !exiting && "animate-intro-fade-in"
      )}
      aria-hidden={exiting}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 via-white to-white pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-[#0d9488]/30" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50/80 shadow-sm">
          <SparkleMopIcon className="h-10 w-10 text-[#0d9488]" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Housekeeping Reports
        </h1>
        <p className="mt-3 text-lg text-slate-600">Daily operations, simplified</p>

        <button
          type="button"
          onClick={onStart}
          disabled={!buttonEnabled}
          className={cn(
            "mt-10 w-full max-w-xs rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-teal-600/25 transition-all",
            "hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
            buttonPulse && buttonEnabled && "animate-intro-pulse"
          )}
        >
          Start Report
        </button>

        <p className="mt-8 text-sm text-slate-500">
          Track shifts • Log tasks • Generate PDFs
        </p>
      </div>
    </div>
  );
}

function SparkleMopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M24 4v4M24 40v4M4 24h4M40 24h4M9.86 9.86l2.83 2.83M35.31 35.31l2.83 2.83M9.86 38.14l2.83-2.83M35.31 12.69l2.83-2.83"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M18 32l6-18 6 18-6-4-6 4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 36h20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="34" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
