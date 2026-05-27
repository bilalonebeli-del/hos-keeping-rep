import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "border-transparent bg-primary-600 text-white",
        variant === "secondary" && "border-transparent bg-neutral-100 text-neutral-800",
        variant === "outline" && "border-neutral-200 text-neutral-700",
        variant === "success" && "border-transparent bg-success-50 text-success",
        variant === "warning" && "border-transparent bg-warning-50 text-warning",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
