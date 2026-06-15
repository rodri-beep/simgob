"use client";

import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import { irpfData, isData, spendingPolicies } from "@/lib/data";
import {
  classifyPolitics,
  SOCIAL_POLICY_IDS,
  SECURITY_POLICY_IDS,
} from "@/lib/engine/politics";
import { Panel } from "@/components/ui/Panel";

const baseById: Record<string, number> = Object.fromEntries(
  spendingPolicies.map((p) => [p.id, p.amount]),
);

export function ProfilePanel() {
  const { irpf, is, totals } = useSimResults();
  const scale = useSim((s) => s.irpfScale);
  const overrides = useSim((s) => s.spendingOverrides);

  const baseGeneral = irpfData.scale.general;
  const topRateDelta =
    (scale.general[4].rate - baseGeneral[4].rate + (scale.general[5].rate - baseGeneral[5].rate)) / 2;

  const deltaFor = (ids: string[]) =>
    ids.reduce((a, id) => a + ((overrides[id] ?? baseById[id] ?? 0) - (baseById[id] ?? 0)), 0);

  const profile = classifyPolitics({
    taxDelta: irpf.delta + is.delta,
    topRateDelta,
    socialDelta: deltaFor(SOCIAL_POLICY_IDS),
    securityDelta: deltaFor(SECURITY_POLICY_IDS),
    totalSpendDelta: totals.spending - totals.baseSpending,
    balance: totals.balance,
    baseBalance: totals.baseBalance,
  });

  return (
    <Panel tone="teal" title="Tu perfil político · con humor">
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
