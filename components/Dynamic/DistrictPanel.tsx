"use client";

import { useSim } from "@/lib/store";
import { buildingById, spendingForBuilding, buildingTotal, meta } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { SpendingLineEditor } from "./SpendingLineEditor";
import { formatM, formatMDecimal, formatPctValue } from "@/lib/engine/format";

export function DistrictPanel() {
  const selected = useSim((s) => s.selectedBuilding);
  const select = useSim((s) => s.selectBuilding);
  const overrides = useSim((s) => s.spendingOverrides);

  if (!selected) {
    return (
      <Panel title="Distrito de gasto" tone="olive">
        <div className="px-2 py-8 text-center text-[11px] text-ink-soft">
          Pulsa un edificio del mapa para ajustar sus partidas de gasto.
          <div className="mt-2 font-chrome uppercase text-[9px] text-orange">
            Recorta o amplía cada partida y mira el saldo
          </div>
        </div>
      </Panel>
    );
  }

  const building = buildingById(selected);
  const policies = spendingForBuilding(selected);
  const baseTotal = buildingTotal(selected);
  const total = policies.reduce(
    (a, p) => a + (overrides[p.id] ?? p.amount),
    0,
  );
  const delta = total - baseTotal;
  const changed = Math.abs(delta) > 0.05;
  const pctOfSpending = (total / meta.totalSpendingOfficial) * 100;

  return (
    <Panel
      tone="olive"
      title={`${building?.label ?? selected}`}
      right={
        <span className="flex items-center gap-2">
          <EstimateBadge />
          <button
            type="button"
            className="font-chrome uppercase text-[9px] underline"
            onClick={() => select(null)}
          >
            cerrar ✕
          </button>
        </span>
      }
      bodyClassName="space-y-2"
    >
      <div className="flex items-end justify-between gap-2">
        <p className="text-[10px] text-ink-soft leading-snug">{building?.blurb}</p>
        <div className="text-right shrink-0">
          <div className="tnum font-data font-bold text-[18px] text-ink">
            {formatM(total)}
          </div>
          {changed ? (
            <div
              className={`tnum font-data text-[9px] ${
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

      <div className="space-y-1">
        {policies.map((p) => (
          <SpendingLineEditor key={p.id} policy={p} />
        ))}
      </div>
    </Panel>
  );
}
