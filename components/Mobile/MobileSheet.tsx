"use client";

import { useState } from "react";
import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import {
  buildingById,
  spendingForBuilding,
  buildingTotal,
  revenueLines,
  irpfData,
  isData,
  human,
  meta,
} from "@/lib/data";
import {
  formatM,
  formatMDecimal,
  formatPctValue,
  formatEur,
} from "@/lib/engine/format";
import { SpendingLineEditor } from "@/components/Dynamic/SpendingLineEditor";
import { IrpfSimple } from "@/components/ControlPanel/IrpfSimple";
import { IsSimple } from "@/components/ControlPanel/IsSimple";
import { IrpfControls } from "@/components/ControlPanel/IrpfControls";
import { IsControls } from "@/components/ControlPanel/IsControls";
import { WinnersLosersChart } from "@/components/Dynamic/WinnersLosersChart";
import type { SheetState } from "./model";

const INFO_NOTES: Record<string, string> = {
  cotizaciones:
    "Cotizaciones a la Seguridad Social de trabajadores y empresas. Financian sobre todo pensiones y desempleo. No se ajustan por separado en esta versión.",
  otros_impuestos:
    "IVA, impuestos especiales (carburantes, tabaco, alcohol), etc. El bloque grande de la recaudación; no se modela en detalle aquí.",
  otros_ingresos:
    "Tasas, rentas de la propiedad, transferencias recibidas y otros ingresos no tributarios.",
};

/** Bottom drawer for adjusting a spending area or a tax (or reading a source). */
export function MobileSheet({
  sheet,
  onClose,
}: {
  sheet: NonNullable<SheetState>;
  onClose: () => void;
}) {
  const overrides = useSim((s) => s.spendingOverrides);
  const { irpf, is, totals } = useSimResults();

  let title = "";
  let blurb = "";
  let totalFmt = "";
  let deltaFmt = "";
  let deltaColor = "#4a4636";
  let body: React.ReactNode = null;

  if (sheet.t === "spend") {
    const building = buildingById(sheet.id);
    const policies = spendingForBuilding(sheet.id);
    const baseTotal = buildingTotal(sheet.id);
    const total = policies.reduce((a, p) => a + (overrides[p.id] ?? p.amount), 0);
    const delta = total - baseTotal;
    const changed = Math.abs(delta) > 0.05;
    const delegated = building?.delegated;
    const delegatedPct = delegated && baseTotal > 0 ? (delegated.amount / baseTotal) * 100 : 0;

    title = building?.label ?? sheet.id;
    blurb = building?.blurb ?? "";
    totalFmt = formatM(total);
    deltaFmt = changed
      ? `${formatMDecimal(delta, { sign: true })} vs. ${formatM(baseTotal)}`
      : `${formatPctValue((total / meta.totalSpendingOfficial) * 100, 1)} del gasto`;
    deltaColor = delta < 0 ? "#4e7d3a" : delta > 0 ? "#a83c2e" : "#4a4636";

    body = (
      <>
        {delegated && (
          <div className="mt-2.5 bg-parchment bevel-in border border-bevel-dark/30 px-2.5 py-2 text-[10.5px] text-ink-soft leading-relaxed">
            De este gasto, ≈ <b className="text-ink">{formatM(delegated.amount)}</b> (
            {formatPctValue(delegatedPct, 0)}) lo ejecuta <b className="text-ink">{delegated.who}</b>
            , no la Administración central.
          </div>
        )}
        <div className="flex flex-col gap-2.5 mt-3">
          {policies.map((p) => (
            <SpendingLineEditor key={p.id} policy={p} />
          ))}
        </div>
      </>
    );
  } else if (sheet.t === "irpf") {
    const line = irpfData.officialRevenue + irpfData.stateDeltaShare * irpf.delta;
    title = "IRPF";
    blurb = "Impuesto sobre la renta. Mueve todos los tramos a la vez.";
    totalFmt = formatM(line);
    deltaFmt = `${formatMDecimal(irpf.delta, { sign: true })} vs. real`;
    deltaColor = irpf.delta < 0 ? "#a83c2e" : "#4e7d3a";
    body = (
      <div className="mt-3">
        <IrpfSimple />
        <IrpfDetailSection />
      </div>
    );
  } else if (sheet.t === "is") {
    const line = isData.officialRevenue + isData.stateDeltaShare * is.delta;
    title = "Impuesto de Sociedades";
    blurb = "Impuesto sobre el beneficio de las empresas.";
    totalFmt = formatM(line);
    deltaFmt = `${formatMDecimal(is.delta, { sign: true })} vs. real`;
    deltaColor = is.delta < 0 ? "#a83c2e" : "#4e7d3a";
    body = (
      <div className="mt-3">
        <IsSimple />
        <IsDetailSection />
      </div>
    );
  } else {
    const line = revenueLines.find((l) => l.id === sheet.id);
    const amount = line?.amount ?? 0;
    const { population, households } = human.constants;
    title = line?.label ?? sheet.id;
    blurb = "De dónde sale el dinero.";
    totalFmt = formatM(amount);
    deltaFmt = `${formatPctValue((amount / totals.revenue) * 100, 1)} de los ingresos`;
    body = (
      <>
        <div className="flex flex-col gap-2 mt-3">
          <InfoRow label="≈ por hogar" value={`${formatEur((amount * 1e6) / households)}/año`} />
          <InfoRow label="≈ por habitante" value={`${formatEur((amount * 1e6) / population)}/año`} />
        </div>
        <div className="mt-2.5 bg-parchment-dark border border-bevel-dark/40 px-2.5 py-2 text-[10.5px] text-ink-soft leading-relaxed">
          {INFO_NOTES[sheet.id] ?? line?.note ?? ""}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        onClick={onClose}
        className="absolute inset-0 z-30 anim-sheet-fade"
        style={{ background: "rgba(33,31,24,.55)" }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 z-[31] max-h-[88%] flex flex-col bg-panel overflow-hidden anim-sheet-up"
        style={{
          boxShadow: "0 -10px 30px rgba(0,0,0,.3)",
          borderTop: "2px solid #8a7f5d",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <div className="bg-olive-dark text-parchment font-chrome uppercase text-[10.5px] tracking-wide px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="flex-1 min-w-0 truncate">{title}</span>
          <span
            className="font-chrome text-[7.5px] flex-none px-1.5 py-1"
            style={{ background: "#e09a2d", color: "#211f18" }}
          >
            ▲ Ilustrativa
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex-none font-chrome uppercase text-[8.5px] bg-teal text-parchment border border-teal-dark px-2 py-1.5 cursor-pointer"
          >
            cerrar ✕
          </button>
        </div>

        <div className="no-scrollbar overflow-y-auto p-3">
          <div className="flex justify-between items-end gap-2.5">
            <p className="text-[11.5px] text-ink-soft leading-snug m-0 max-w-[58%]">{blurb}</p>
            <div className="text-right flex-none">
              <div className="tnum font-data font-extrabold text-[22px]">{totalFmt}</div>
              <div className="tnum font-data text-[10.5px]" style={{ color: deltaColor }}>
                {deltaFmt}
              </div>
            </div>
          </div>
          {body}
        </div>
      </div>
    </>
  );
}

/**
 * Collapsible "by-tramo / detail" block for the IRPF sheet — restores the full
 * desktop power on mobile: the winners/losers-by-bracket chart and the
 * per-bracket escala editor (general + savings). Calm by default.
 */
function IrpfDetailSection() {
  const [open, setOpen] = useState(false);
  const { irpf } = useSimResults();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-active={open}
        className="btn-retro w-full mt-3 text-[10px] py-2 justify-center flex"
      >
        {open ? "▾ Ocultar tramos y detalle" : "▸ Editar por tramo / ver detalle"}
      </button>
      {open && (
        <div className="mt-2.5 border-t border-bevel-dark/30 pt-3 space-y-3">
          <WinnersLosersChart brackets={irpf.brackets} />
          <div className="border-t border-bevel-dark/30 pt-1">
            <IrpfControls />
          </div>
        </div>
      )}
    </>
  );
}

/** Collapsible IS detail — adds the minimum-rate lever and the effective-rate note. */
function IsDetailSection() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-active={open}
        className="btn-retro w-full mt-3 text-[10px] py-2 justify-center flex"
      >
        {open ? "▾ Ocultar detalle" : "▸ Tipo mínimo / detalle"}
      </button>
      {open && (
        <div className="mt-2.5 border-t border-bevel-dark/30 pt-3">
          <IsControls />
        </div>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline bg-parchment bevel-in border border-bevel-dark/30 px-2.5 py-2">
      <span className="text-[11.5px] text-ink-soft">{label}</span>
      <span className="tnum font-data text-[12.5px] font-bold">{value}</span>
    </div>
  );
}
