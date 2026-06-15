"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
  /** Duration of the count tween in ms. */
  duration?: number;
}

/**
 * Tweens the displayed value toward `value` (the tycoon money-counter effect).
 * The animation FOLLOWS the number — it never blocks the recalculation, and it
 * is disabled under prefers-reduced-motion (spec §5.3).
 */
export function AnimatedNumber({
  value,
  format,
  className = "",
  duration = 260,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    const to = value;
    if (reduce || from === to) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
