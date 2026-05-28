// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

type IntroProps = {
  exiting?: boolean;
};

function SparkleBroomIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-white"
      aria-hidden
    >
      <path
        d="M32 8l2.5 7.6H42l-6 4.4 2.3 7-6.8-4.9-6.8 4.9 2.3-7-6-4.4h7.5L32 8z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M28 26h8v6c0 8-3 14-8 18-5-4-8-10-8-18v-6z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M18 48c4 3 9 5 14 5s10-2 14-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M22 34h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function Intro({ exiting = false }: IntroProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 ${
        exiting ? "animate-intro-overlay-exit" : "animate-intro-overlay-enter"
      }`}
      role="dialog"
      aria-label="Housekeeping Pro intro"
      aria-modal="true"
    >
      <div className="intro-mesh-bg absolute inset-0" aria-hidden />

      <div
        className={`relative w-full max-w-md animate-intro-card-enter rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:p-12 ${
          exiting ? "!animate-intro-card-exit" : ""
        }`}
      >
        <span className="absolute bottom-4 right-5 text-xs font-medium text-white/50 dark:text-white/40">
          v1.0
        </span>

        <div className="flex flex-col items-center text-center">
          <div className="animate-intro-logo-pulse mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <SparkleBroomIcon />
          </div>

          <h1 className="text-3xl font-bold tracking-wider text-white sm:text-4xl">
            Housekeeping Pro
          </h1>

          <p className="mt-4 text-sm font-medium tracking-[0.2em] text-white/80 sm:text-base">
            <span className="animate-intro-tagline-1 inline-block">Clean.</span>{" "}
            <span className="animate-intro-tagline-2 inline-block">Track.</span>{" "}
            <span className="animate-intro-tagline-3 inline-block">Perform.</span>
          </p>

          <div className="mt-10 flex items-center justify-center gap-2" aria-label="Loading">
            <span className="intro-dot h-2.5 w-2.5 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300" />
            <span className="intro-dot intro-dot-delay-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-300 to-indigo-300" />
            <span className="intro-dot intro-dot-delay-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-300 to-teal-300" />
          </div>

          <div className="relative mt-8 h-10 w-10" aria-hidden>
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="url(#introRingGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80 100"
                className="animate-intro-ring-spin origin-center"
              />
              <defs>
                <linearGradient id="introRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
