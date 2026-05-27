export function StickyHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-center px-4">
        <h1 className="text-lg font-semibold tracking-tight">Housekeeping Reports</h1>
      </div>
    </header>
  );
}
