"use client";

import { formatPct } from "@/lib/engine/format";

interface RateSliderProps {
  label: string;
  /** Current rate as a fraction (0.19 = 19 %). */
  value: number;
  /** Base/official rate as a fraction, for the delta indicator. */
  base: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (rate: number) => void;
}

export function RateSlider({
  label,
  value,
  base,
  min = 0,
  max = 0.6,
  step = 0.005,
  onChange,
}: RateSliderProps) {
  const delta = value - base;
  const changed = Math.abs(delta) > 1e-9;
  const deltaColor =
    delta > 0 ? "text-brick" : delta < 0 ? "text-moss" : "text-ink-soft";

  return (
    <div className="px-2 py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-chrome uppercase text-[9px] text-ink-soft truncate">
          {label}
        </span>
        <span className="tnum font-data font-bold text-[13px] text-ink">
          {formatPct(value, 1)}
        </span>
      </div>
      <input
        type="range"
        className="slider-retro w-full mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={`${label}: ${formatPct(value, 1)}`}
      />
      <div className="h-3 mt-0.5">
        {changed && (
          <span className={`tnum font-data text-[10px] ${deltaColor}`}>
            {delta > 0 ? "▲" : "▼"} {formatPct(Math.abs(delta), 1)} vs.{" "}
            {formatPct(base, 1)}
          </span>
        )}
      </div>
    </div>
  );
}
