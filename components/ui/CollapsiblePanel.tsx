"use client";

import { useState, type ReactNode } from "react";

interface CollapsiblePanelProps {
  title: ReactNode;
  /** One-line explanation shown under the title (always visible). */
  subtitle: string;
  right?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  tone?: "teal" | "olive";
  className?: string;
}

/** A beveled panel whose body collapses; the title bar toggles it. */
export function CollapsiblePanel({
  title,
  subtitle,
  right,
  defaultOpen = false,
  children,
  tone = "teal",
  className = "",
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bar = tone === "olive" ? "bg-olive-dark" : "bg-teal-dark";
  return (
    <section className={`panel flex flex-col ${className}`}>
      <header
        className={`titlebar ${bar} flex items-center justify-between gap-2 px-2 py-1 text-[10px] sm:text-[11px] cursor-pointer select-none`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span aria-hidden className="text-amber">{open ? "▾" : "▸"}</span>
          {title}
        </span>
        {right && <span className="shrink-0">{right}</span>}
      </header>
      <div className="px-2 sm:px-3 pt-1.5 text-[10px] text-ink-soft leading-snug">
        {subtitle}
      </div>
      {open && <div className="p-2 sm:p-3 pt-2">{children}</div>}
    </section>
  );
}
