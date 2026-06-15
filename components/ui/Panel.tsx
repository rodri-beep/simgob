import type { ReactNode } from "react";

interface PanelProps {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "teal" | "olive";
}

/** A beveled window-style panel with an optional caption bar. */
export function Panel({
  title,
  right,
  children,
  className = "",
  bodyClassName = "",
  tone = "teal",
}: PanelProps) {
  const bar = tone === "olive" ? "bg-olive-dark" : "bg-teal-dark";
  return (
    <section className={`panel flex flex-col ${className}`}>
      {title !== undefined && (
        <header
          className={`titlebar ${bar} flex items-center justify-between gap-2 px-2 py-1 text-[10px] sm:text-[11px]`}
        >
          <span className="truncate">{title}</span>
          {right && <span className="shrink-0">{right}</span>}
        </header>
      )}
      <div className={`p-2 sm:p-3 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
