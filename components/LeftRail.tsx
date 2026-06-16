"use client";

import { useSim } from "@/lib/store";
import { buildings, buildingTotal } from "@/lib/data";
import { BUILDING_COLORS } from "@/lib/buildingColors";
import { formatM } from "@/lib/engine/format";
import { track } from "@/lib/analytics";

export function LeftRail() {
  const selected = useSim((s) => s.selectedBuilding);
  const select = useSim((s) => s.selectBuilding);
  const setImpuestos = useSim((s) => s.setImpuestosOpen);

  const sorted = [...buildings].sort(
    (a, b) => buildingTotal(b.id) - buildingTotal(a.id),
  );

  return (
    <nav className="panel p-1.5 flex flex-col gap-1">
      <div className="titlebar bg-teal-dark px-2 py-1 text-[9px] -m-1.5 mb-0.5">
        Menú
      </div>
      <button
        type="button"
        className="rail-btn"
        data-active={selected === null}
        onClick={() => select(null)}
      >
        <span aria-hidden className="w-3 h-3 bg-parchment-dark bevel-out-thin" />
        Resumen
      </button>
      <button
        type="button"
        className="rail-btn"
        onClick={() => {
          track("taxes_modal_opened");
          setImpuestos(true);
        }}
        title="Ajustar IRPF e Impuesto de Sociedades"
      >
        <span aria-hidden className="w-3 h-3 bg-amber bevel-out-thin shrink-0" />
        <span className="truncate flex-1">Impuestos</span>
      </button>

      <div className="font-chrome uppercase text-[8px] text-ink-soft px-2 pt-1.5">
        Gasto por área
      </div>
      {sorted.map((b) => (
        <button
          key={b.id}
          type="button"
          className="rail-btn"
          data-active={selected === b.id}
          onClick={() => select(b.id)}
          title={`${b.label}: ${formatM(buildingTotal(b.id))}`}
        >
          <span
            aria-hidden
            className="w-3 h-3 bevel-out-thin shrink-0"
            style={{ backgroundColor: BUILDING_COLORS[b.id] }}
          />
          <span className="truncate flex-1">{b.label}</span>
        </button>
      ))}
    </nav>
  );
}
