// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

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
        "fixed inset-0 z-[100] flex items-center justify-center bg-surface px-6",
        "transition-opacity duration-300 ease-out",
        exiting ? "opacity-0 pointer-events-none" : "opacity-100",
        !exiting && "animate-intro-fade-in"
      )}
      aria-hidden={exiting}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50/60 via-white to-white" />
      <div className="absolute top-0 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-primary-600/30" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 shadow-card">
          <SparkleMopIcon className="h-10 w-10 text-primary-600" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Housekeeping Reports
        </h1>
        <p className="mt-3 text-lg text-neutral-600">Daily operations, simplified</p>

        <button
          type="button"
          onClick={onStart}
          disabled={!buttonEnabled}
          className={cn(
            "mt-10 w-full max-w-xs rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all",
            "hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
            buttonPulse && buttonEnabled && "animate-intro-pulse"
          )}
        >
          Start Report
        </button>

        <p className="mt-8 text-sm text-neutral-600">
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
