// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface shadow-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-center px-4">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
          Housekeeping Reports
        </h1>
      </div>
    </header>
  );
}
