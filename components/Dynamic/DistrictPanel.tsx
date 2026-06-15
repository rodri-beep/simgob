"use client";

import { useSim } from "@/lib/store";
import { buildingById, spendingForBuilding, buildingTotal, meta } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { formatM, formatPctValue } from "@/lib/engine/format";

export function DistrictPanel() {
  const selected = useSim((s) => s.selectedBuilding);
  const select = useSim((s) => s.selectBuilding);

  if (!selected) {
    return (
      <Panel title="Distrito de gasto" tone="olive">
        <div className="px-2 py-8 text-center text-[11px] text-ink-soft">
          Pulsa un edificio del mapa para ver sus partidas de gasto.
          <div className="mt-2 font-chrome uppercase text-[9px] text-orange">
            El gasto es solo lectura en v1
          </div>
        </div>
      </Panel>
    );
  }

  const building = buildingById(selected);
  const policies = spendingForBuilding(selected);
  const total = buildingTotal(selected);
  const pctOfSpending = (total / meta.totalSpendingOfficial) * 100;
  const maxAmount = Math.max(...policies.map((p) => p.amount), 1);

  return (
    <Panel
      tone="olive"
      title={`${building?.label ?? selected}`}
      right={
        <button
          type="button"
          className="font-chrome uppercase text-[9px] underline"
          onClick={() => select(null)}
        >
          cerrar ✕
        </button>
      }
      bodyClassName="space-y-2"
    >
      <div className="flex items-end justify-between gap-2">
        <p className="text-[10px] text-ink-soft leading-snug">{building?.blurb}</p>
        <div className="text-right shrink-0">
          <div className="tnum font-data font-bold text-[18px] text-ink">
            {formatM(total)}
          </div>
          <div className="font-chrome uppercase text-[8px] text-ink-soft">
            {formatPctValue(pctOfSpending, 1)} del gasto
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {policies.map((p) => (
          <div key={p.id} className="panel-inset px-2 py-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-data text-[11px] text-ink">{p.label}</span>
              <span className="tnum font-data font-bold text-[11px] text-ink whitespace-nowrap">
                {formatM(p.amount)}
              </span>
            </div>
            <div className="h-1.5 mt-1 bg-parchment-dark">
              <div
                className="h-full bg-olive"
                style={{ width: `${(p.amount / maxAmount) * 100}%` }}
              />
            </div>
            {p.description && (
              <p className="text-[9px] text-ink-soft mt-1 leading-snug">{p.description}</p>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
