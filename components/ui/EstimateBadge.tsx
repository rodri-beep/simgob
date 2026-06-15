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
      className={`inline-flex items-center gap-1 bg-amber text-ink border border-bevel-dark/50 bevel-out-thin font-data font-semibold text-[10px] sm:text-[11px] px-1.5 py-0.5 leading-tight ${className}`}
    >
      <span aria-hidden className="text-[9px]">▲</span>
      {label}
    </span>
  );
}
