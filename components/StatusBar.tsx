"use client";

import { useSimResults } from "@/lib/useSimResults";
import { meta } from "@/lib/data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { formatM, formatMDecimal, formatGdpPct } from "@/lib/engine/format";

function Stat({
  label,
  children,
  tone = "ink",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "ink" | "moss" | "brick";
}) {
  const color =
    tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  return (
    <div className="panel-inset px-3 py-2 min-w-0">
      <div className="font-chrome uppercase text-[9px] text-ink-soft tracking-wide">
        {label}
      </div>
      <div className={`tnum font-data font-bold text-[15px] sm:text-[19px] ${color}`}>
        {children}
      </div>
    </div>
  );
}

export function StatusBar() {
  const { totals, dirty } = useSimResults();
  const deficit = totals.balance < 0;

  return (
    <div className="panel">
      <div className="bg-olive-dark text-parchment titlebar px-2 py-1 text-[10px] flex items-center justify-between">
        <span>Situación presupuestaria · perímetro PGE {meta.baseYear}</span>
        <EstimateBadge />
      </div>
      <div className="p-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Stat label="Ingresos" tone="moss">
          <AnimatedNumber value={totals.revenue} format={(n) => formatM(n)} />
        </Stat>
        <Stat label="Gastos" tone="brick">
          {formatM(totals.spending)}
        </Stat>
        <Stat label={deficit ? "Saldo (déficit)" : "Saldo (superávit)"} tone={deficit ? "brick" : "moss"}>
          <AnimatedNumber
            value={totals.balance}
            format={(n) => formatM(n, { sign: true })}
          />
        </Stat>
        <Stat label="Saldo / PIB" tone={deficit ? "brick" : "moss"}>
          <AnimatedNumber
            value={totals.balance}
            format={(n) => formatGdpPct(n, meta.gdp)}
          />
        </Stat>
      </div>
      {dirty && (
        <div className="px-3 pb-2 -mt-1 font-chrome uppercase text-[9px] text-orange tracking-wide">
          Cambio vs. escenario real:{" "}
          <span className="tnum font-data font-bold">
            {formatMDecimal(totals.balanceDelta, { sign: true })}
          </span>{" "}
          de saldo
        </div>
      )}
    </div>
  );
}
