"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  right?: ReactNode;
  /** Tailwind max-width class for the window. */
  maxWidth?: string;
}

/** A retro window-style modal centered over a dimmed backdrop. */
export function Modal({
  title,
  onClose,
  children,
  right,
  maxWidth = "max-w-xl",
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-ink/55" aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`panel relative w-full ${maxWidth} max-h-[88vh] flex flex-col outline-none`}
      >
        <header className="titlebar bg-olive-dark flex items-center justify-between gap-2 px-2 py-1.5 text-[11px]">
          <span className="truncate">{title}</span>
          <span className="flex items-center gap-2 shrink-0">
            {right}
            <button
              type="button"
              onClick={onClose}
              className="btn-retro text-[9px] py-0.5"
              aria-label="Cerrar"
            >
              cerrar ✕
            </button>
          </span>
        </header>
        <div className="overflow-y-auto p-2 sm:p-3">{children}</div>
      </div>
    </div>
  );
}
