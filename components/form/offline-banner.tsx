// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getPendingCount } from "@/lib/offline-queue";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const pending = typeof window !== "undefined" ? getPendingCount() : 0;

  if (isOnline && pending === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-warning-50 px-4 py-2 text-sm font-medium text-warning">
      <WifiOff className="h-4 w-4 shrink-0" />
      {!isOnline ? (
        <span>Offline — report will sync when back online</span>
      ) : (
        <span>{pending} report(s) pending sync</span>
      )}
    </div>
  );
}
