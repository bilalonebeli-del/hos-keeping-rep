// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useCallback, useEffect, useState } from "react";
import { ReportForm } from "@/components/form/report-form";
import { SplashScreen } from "@/components/intro/splash-screen";
import { cn } from "@/lib/utils";

const INTRO_SEEN_KEY = "hasSeenIntro";

export function HomePageClient() {
  const [showIntro, setShowIntro] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY) === "true";

    if (hasSeenIntro) {
      setShowIntro(false);
      setShowForm(true);
      return;
    }

    const enableTimer = window.setTimeout(() => setButtonEnabled(true), 1500);
    const pulseTimer = window.setTimeout(() => setButtonPulse(true), 2000);

    return () => {
      window.clearTimeout(enableTimer);
      window.clearTimeout(pulseTimer);
    };
  }, []);

  const handleStartReport = useCallback(() => {
    if (!buttonEnabled && showIntro) return;

    localStorage.setItem(INTRO_SEEN_KEY, "true");
    setIntroExiting(true);

    window.setTimeout(() => {
      setShowIntro(false);
      setShowForm(true);
      setIntroExiting(false);
    }, 300);
  }, [buttonEnabled, showIntro]);

  if (!mounted) {
    return <div className="min-h-[50vh] bg-white" />;
  }

  return (
    <>
      <SplashScreen
        visible={showIntro}
        exiting={introExiting}
        buttonEnabled={buttonEnabled || !showIntro}
        buttonPulse={buttonPulse}
        onStart={handleStartReport}
      />
      <div
        className={cn(
          "transition-opacity duration-300",
          showForm ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
        )}
      >
        {showForm && <ReportForm />}
      </div>
    </>
  );
}
