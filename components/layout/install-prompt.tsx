"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPrompt() {
  const { showBanner, install, dismiss, canInstall } = useInstallPrompt();

  if (!showBanner || !canInstall) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 mx-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex-1 text-sm">
          <p className="font-medium">Add to Home Screen</p>
          <p className="text-muted-foreground">Install for quick access like an app</p>
        </div>
        <Button size="icon" variant="ghost" onClick={dismiss} aria-label="Dismiss">
          <X className="h-5 w-5" />
        </Button>
        <Button size="sm" onClick={install}>
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
      </div>
    </div>
  );
}
