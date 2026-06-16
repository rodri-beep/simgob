"use client";

import { usePolitics } from "@/lib/usePolitics";
import { Panel } from "@/components/ui/Panel";

export function ProfilePanel() {
  const profile = usePolitics();

  return (
    <Panel tone="teal" title="Tu perfil político">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-[34px] leading-none">
          {profile.emoji}
        </span>
        <div className="min-w-0">
          <div className="font-chrome uppercase text-[14px] text-ink leading-tight">
            {profile.label}
          </div>
          <p className="text-[11px] text-ink-soft leading-snug mt-0.5">{profile.blurb}</p>
        </div>
      </div>

      {profile.reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.reasons.map((r) => (
            <span
              key={r}
              className="font-chrome uppercase text-[8px] bg-parchment-dark text-ink-soft border border-bevel-dark/40 px-1.5 py-0.5 leading-none"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}
