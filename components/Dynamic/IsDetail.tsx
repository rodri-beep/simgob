"use client";

import { useSimResults } from "@/lib/useSimResults";
import { isData } from "@/lib/data";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatM, formatMDecimal, formatPct } from "@/lib/engine/format";

function Stat({ label, value, sub, tone = "ink" }: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "ink" | "moss" | "brick";
}) {
  const color = tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  return (
    <div className="panel-inset px-2 py-1.5">
      <div className="font-chrome uppercase text-[8px] text-ink-soft">{label}</div>
      <div className={`tnum font-data font-bold text-[15px] ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-ink-soft">{sub}</div>}
    </div>
  );
}

export function IsDetail() {
  const { is } = useSimResults();
  const tone = is.delta > 0 ? "moss" : is.delta < 0 ? "brick" : "ink";

  return (
    <CollapsiblePanel
      title="Sociedades · recaudación y tipos"
      subtitle="Recaudación del Impuesto de Sociedades, tipo efectivo vs. nominal y componentes."
      right={<EstimateBadge />}
    >
      <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Recaudación IS"
          value={
            <AnimatedNumber value={is.scenarioRevenue} format={(n) => formatM(n)} />
          }
          sub={`base ${formatM(is.officialRevenue)}`}
        />
        <Stat
          label="Δ recaudación"
          tone={tone}
          value={
            <AnimatedNumber
              value={is.delta}
              format={(n) => formatMDecimal(n, { sign: true })}
            />
          }
          sub="al saldo (AAPP)"
        />
        <Stat
          label="Tipo efectivo"
          value={formatPct(is.effectiveRate, 1)}
          sub={`nominal ${formatPct(is.scenarioNominalRate, 0)}`}
        />
      </div>

      <div className="panel-inset px-3 py-2 text-[10px] text-ink-soft leading-snug space-y-1">
        <div className="flex justify-between">
          <span>Efecto del tipo general (nominal)</span>
          <span
            className={`tnum font-data ${
              is.deltaNominal > 0 ? "text-moss" : is.deltaNominal < 0 ? "text-brick" : ""
            }`}
          >
            {formatMDecimal(is.deltaNominal, { sign: true })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Efecto del tipo mínimo (aprox. gruesa)</span>
          <span
            className={`tnum font-data ${is.deltaMinimum > 0 ? "text-moss" : ""}`}
          >
            {formatMDecimal(is.deltaMinimum, { sign: true })}
          </span>
        </div>
        <p className="pt-1 border-t border-bevel-dark/20">
          El tipo efectivo medio ({formatPct(is.effectiveRate, 1)}) ya supera el 15 %
          actual; con datos agregados, subir el tipo mínimo solo añade recaudación
          cuando supera ese tipo efectivo medio. Es una estimación ilustrativa.
        </p>
      </div>

      <ul className="text-[9px] text-ink-soft list-disc pl-4 space-y-0.5">
        {isData.notes.slice(0, 3).map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      </div>
    </CollapsiblePanel>
  );
}
