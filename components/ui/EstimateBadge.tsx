interface EstimateBadgeProps {
  className?: string;
  /** "full" shows the long label; "short" a compact chip. */
  variant?: "full" | "short";
}

/**
 * Mandatory label: every simulated figure must be marked as an illustrative,
 * unofficial estimate (spec §6.3).
 */
export function EstimateBadge({
  className = "",
  variant = "short",
}: EstimateBadgeProps) {
  const label =
    variant === "full"
      ? "Estimación ilustrativa · no oficial"
      : "Estimación ilustrativa";
  return (
    <span
      title="Cifra estimada con datos agregados. No es una cifra oficial."
      className={`inline-flex items-center gap-1 bg-amber/25 text-ink-soft border border-amber/60 font-chrome uppercase text-[8px] sm:text-[9px] px-1.5 py-0.5 leading-none tracking-wide ${className}`}
    >
      <span aria-hidden>▲</span>
      {label}
    </span>
  );
}
