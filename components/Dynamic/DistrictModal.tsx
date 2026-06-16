"use client";

import { useSim } from "@/lib/store";
import { buildingById, spendingForBuilding, buildingTotal, meta } from "@/lib/data";
import { Modal } from "@/components/ui/Modal";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { BudgetImpactBar } from "@/components/ui/BudgetImpactBar";
import { SpendingLineEditor } from "./SpendingLineEditor";
import { formatM, formatMDecimal, formatPctValue } from "@/lib/engine/format";

/** Spending editor for a district, shown as a modal over the city. */
export function DistrictModal() {
  const selected = useSim((s) => s.selectedBuilding);
  const select = useSim((s) => s.selectBuilding);
  const overrides = useSim((s) => s.spendingOverrides);

  if (!selected) return null;

  const building = buildingById(selected);
  const policies = spendingForBuilding(selected);
  const baseTotal = buildingTotal(selected);
  const total = policies.reduce((a, p) => a + (overrides[p.id] ?? p.amount), 0);
  const delta = total - baseTotal;
  const changed = Math.abs(delta) > 0.05;
  const pctOfSpending = (total / meta.totalSpendingOfficial) * 100;

  return (
    <Modal
      title={building?.label ?? selected}
      right={<EstimateBadge />}
      onClose={() => select(null)}
    >
      <BudgetImpactBar />
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <p className="text-[11px] text-ink-soft leading-snug max-w-[60%]">
            {building?.blurb}
          </p>
          <div className="text-right shrink-0">
            <div className="tnum font-data font-bold text-[20px] text-ink">
              {formatM(total)}
            </div>
            {changed ? (
              <div
                className={`tnum font-data text-[10px] ${
                  delta < 0 ? "text-moss" : "text-brick"
                }`}
              >
                {formatMDecimal(delta, { sign: true })} vs. {formatM(baseTotal)}
              </div>
            ) : (
              <div className="font-chrome uppercase text-[8px] text-ink-soft">
                {formatPctValue(pctOfSpending, 1)} del gasto
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {policies.map((p) => (
            <SpendingLineEditor key={p.id} policy={p} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
