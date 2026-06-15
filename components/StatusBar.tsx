"use client";

import { useSimResults } from "@/lib/useSimResults";
import { meta, human } from "@/lib/data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { formatM, formatMDecimal, formatGdpPct, formatEur } from "@/lib/engine/format";

function Stat({
  label,
  children,
  base,
  tone = "ink",
}: {
  label: string;
  children: React.ReactNode;
  base: string;
  tone?: "ink" | "moss" | "brick";
}) {
  const color =
    tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  return (
    <div className="panel-inset px-3 py-2 min-w-0">
      <div className="font-chrome uppercase text-[9px] text-ink-soft tracking-wide">
        {label}
      </div>
      <div className={`tnum font-data font-bold text-[15px] sm:text-[19px] leading-tight ${color}`}>
        {children}
      </div>
      <div className="tnum font-data text-[9px] text-ink-soft">orig. {base}</div>
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
        <Stat label="Ingresos" tone="moss" base={formatM(totals.baseRevenue)}>
          <AnimatedNumber value={totals.revenue} format={(n) => formatM(n)} />
        </Stat>
        <Stat label="Gastos" tone="brick" base={formatM(totals.baseSpending)}>
          <AnimatedNumber value={totals.spending} format={(n) => formatM(n)} />
        </Stat>
        <Stat
          label={deficit ? "Saldo (déficit)" : "Saldo (superávit)"}
          tone={deficit ? "brick" : "moss"}
          base={formatM(totals.baseBalance, { sign: true })}
        >
          <AnimatedNumber
            value={totals.balance}
            format={(n) => formatM(n, { sign: true })}
          />
        </Stat>
        <Stat
          label="Saldo / PIB"
          tone={deficit ? "brick" : "moss"}
          base={formatGdpPct(totals.baseBalance, meta.gdp)}
        >
          <AnimatedNumber
            value={totals.balance}
            format={(n) => formatGdpPct(n, meta.gdp)}
          />
        </Stat>
      </div>
      <div className="px-3 pb-2 -mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span className="font-chrome uppercase text-[9px] text-ink-soft tracking-wide">
          Saldo ≈{" "}
          <span className="tnum font-data font-bold">
            {formatEur((totals.balance * 1e6) / human.constants.population, { sign: true })}
          </span>{" "}
          por habitante
        </span>
        {dirty && (
          <span className="font-chrome uppercase text-[9px] text-orange tracking-wide">
            · cambio vs. real:{" "}
            <span className="tnum font-data font-bold">
              {formatMDecimal(totals.balanceDelta, { sign: true })}
            </span>{" "}
            de saldo
          </span>
        )}
      </div>
    </div>
  );
}
