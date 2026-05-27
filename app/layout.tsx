import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { StickyHeader } from "@/components/layout/sticky-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallPrompt } from "@/components/layout/install-prompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "Housekeeping Reports",
  description: "Daily housekeeping reports for airport retail stores",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HK Reports",
  },
  icons: {
    apple: "/icons/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen">
        <StickyHeader />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <BottomNav />
        <InstallPrompt />
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
