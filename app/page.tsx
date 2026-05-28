// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { useEffect, useState } from "react";
import { Intro } from "@/app/components/Intro";
import { HomePageClient } from "@/components/intro/home-page-client";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIntroExiting(true), 1900);
    const hideTimer = window.setTimeout(() => setShowIntro(false), 2200);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {showIntro && <Intro exiting={introExiting} />}
      <HomePageClient />
    </>
  );
}
