"use client";

import { useSimResults } from "@/lib/useSimResults";
import { meta } from "@/lib/data";
import { formatM, formatMDecimal, formatGdpPct } from "@/lib/engine/format";

function Cell({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta?: number;
  tone: "moss" | "brick" | "ink";
}) {
  const color = tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  return (
    <div className="panel-inset px-2 py-1 min-w-0">
      <div className="font-chrome uppercase text-[8px] text-ink-soft tracking-wide">{label}</div>
      <div className={`tnum font-data font-bold text-[13px] leading-tight ${color}`}>{value}</div>
      {delta !== undefined && Math.abs(delta) >= 0.05 && (
        <div className={`tnum font-data text-[9px] ${delta > 0 ? "text-moss" : "text-brick"}`}>
          {formatMDecimal(delta, { sign: true })}
        </div>
      )}
    </div>
  );
}

/** Compact "how this affects the budget" bar, shown at the top of editor popups. */
export function BudgetImpactBar() {
  const { totals } = useSimResults();
  const deficit = totals.balance < 0;
  const revenueDelta = totals.revenue - totals.baseRevenue;
  const spendDelta = totals.spending - totals.baseSpending;

  return (
    <div className="grid grid-cols-3 gap-1.5 mb-2">
      <Cell label="Ingresos" tone="moss" value={formatM(totals.revenue)} delta={revenueDelta} />
      <Cell label="Gastos" tone="brick" value={formatM(totals.spending)} delta={spendDelta} />
      <Cell
        label={deficit ? "Saldo (déficit)" : "Saldo (superávit)"}
        tone={deficit ? "brick" : "moss"}
        value={`${formatM(totals.balance, { sign: true })} · ${formatGdpPct(totals.balance, meta.gdp)}`}
        delta={totals.balanceDelta}
      />
    </div>
  );
}
