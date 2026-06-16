"use client";

import { useState } from "react";
import { useSim } from "@/lib/store";
import { irpfData } from "@/lib/data";
import { RateSlider } from "./RateSlider";
import { formatCount } from "@/lib/engine/format";

function bracketLabel(thresholds: number[], i: number): string {
  const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);
  const lo = thresholds[i];
  const hi = thresholds[i + 1];
  if (i === 0) return `Hasta ${fmt(hi)} €`;
  if (hi === undefined) return `Más de ${fmt(lo)} €`;
  return `${fmt(lo)} – ${fmt(hi)} €`;
}

export function IrpfControls() {
  const scale = useSim((s) => s.irpfScale);
  const setGeneral = useSim((s) => s.setIrpfGeneralRate);
  const setSavings = useSim((s) => s.setIrpfSavingsRate);
  const [showSavings, setShowSavings] = useState(false);

  const generalThresholds = scale.general.map((b) => b.threshold);
  const savingsThresholds = scale.savings.map((b) => b.threshold);

  return (
    <div>
      <div className="px-2 pt-1 pb-2 text-[10px] text-ink-soft leading-snug">
        Escala general (estatal + autonómica) sobre la base liquidable general.
        Mueve los tipos marginales por tramo.
      </div>
      {scale.general.map((b, i) => (
        <RateSlider
          key={`g${i}`}
          label={bracketLabel(generalThresholds, i)}
          value={b.rate}
          base={irpfData.scale.general[i].rate}
          max={0.6}
          onChange={(r) => setGeneral(i, r)}
        />
      ))}

      <button
        type="button"
        className="btn-retro w-full mt-2 text-[9px] py-1 justify-center flex"
        data-active={showSavings}
        onClick={() => setShowSavings((v) => !v)}
      >
        {showSavings ? "▾" : "▸"} Escala del ahorro
      </button>
      {showSavings && (
        <div className="mt-1 border-t border-bevel-dark/30 pt-1">
          <div className="px-2 pb-1 text-[10px] text-ink-soft leading-snug">
            Base del ahorro (intereses, dividendos, plusvalías).
          </div>
          {scale.savings.map((b, i) => (
            <RateSlider
              key={`s${i}`}
              label={bracketLabel(savingsThresholds, i)}
              value={b.rate}
              base={irpfData.scale.savings[i].rate}
              max={0.4}
              onChange={(r) => setSavings(i, r)}
            />
          ))}
        </div>
      )}

      <div className="px-2 pt-2 text-[9px] text-ink-soft leading-snug">
        Base: {formatCount(irpfData.brackets.reduce((a, b) => a + b.declarantes, 0))}{" "}
        declaraciones (IRPF 2023). En el perímetro de las Administraciones Públicas el
        IRPF cuenta íntegro (Estado + CCAA): el cambio se traslada por completo al saldo.
      </div>
    </div>
  );
}
