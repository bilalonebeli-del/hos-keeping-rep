"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getPendingCount } from "@/lib/offline-queue";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const pending = typeof window !== "undefined" ? getPendingCount() : 0;

  if (isOnline && pending === 0) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium flex items-center gap-2 justify-center">
      <WifiOff className="h-4 w-4 shrink-0" />
      {!isOnline ? (
        <span>Offline — report will sync when back online</span>
      ) : (
        <span>{pending} report(s) pending sync</span>
      )}
    </div>
  );
}
