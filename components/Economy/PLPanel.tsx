"use client";

import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import {
  revenueLines,
  spendingPolicies,
  buildings,
  buildingById,
  irpfData,
  isData,
  meta,
} from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatM, formatGdpPct, formatPctValue } from "@/lib/engine/format";

/** How a line's delta colors: by its effect on the balance. */
type DeltaMode = "revenue" | "spending" | "balance";

/** Compact signed number without unit, e.g. "+5.000" / "−12.000". */
function signNum(n: number): string {
  const r = Math.round(n);
  const s = new Intl.NumberFormat("es-ES").format(Math.abs(r));
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${s}`;
}

function deltaClass(delta: number, mode: DeltaMode): string {
  // "Good for the balance" is green: more revenue, less spending, higher saldo.
  const good = mode === "spending" ? delta < 0 : delta > 0;
  return good ? "text-moss" : "text-brick";
}

function Row({
  label,
  value,
  strong,
  tone = "ink",
  delta,
  deltaMode,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "ink" | "moss" | "brick";
  /** Change vs. the original Spain base, in M€. */
  delta?: number;
  deltaMode?: DeltaMode;
}) {
  const color = tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  const showDelta = delta !== undefined && deltaMode !== undefined && Math.abs(delta) >= 0.5;
  return (
    <div className={`flex items-baseline justify-between gap-2 ${strong ? "" : "text-ink-soft"}`}>
      <span className={`${strong ? "font-chrome uppercase text-[10px] " + color : "font-data text-[11px]"}`}>
        {label}
      </span>
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        {showDelta && (
          <span className={`tnum font-data text-[9px] ${deltaClass(delta!, deltaMode!)}`}>
            {signNum(delta!)}
          </span>
        )}
        <span className={`tnum font-data ${strong ? "font-bold text-[13px] " + color : "text-[11px] text-ink"}`}>
          {value}
        </span>
      </span>
    </div>
  );
}

export function PLPanel() {
  const { irpf, is, totals } = useSimResults();
  const overrides = useSim((s) => s.spendingOverrides);

  // Revenue grouped (with the scenario for IRPF/IS) and its original base.
  const lineScenario = (id: string, amount: number) =>
    id === "irpf"
      ? amount + irpfData.stateDeltaShare * irpf.delta
      : id === "is"
        ? amount + isData.stateDeltaShare * is.delta
        : amount;
  const sumCat = (cat: string) =>
    revenueLines.filter((l) => l.category === cat).reduce((a, l) => a + lineScenario(l.id, l.amount), 0);
  const sumCatBase = (cat: string) =>
    revenueLines.filter((l) => l.category === cat).reduce((a, l) => a + l.amount, 0);
  const impuestos = sumCat("tributos");
  const cotizaciones = sumCat("cotizaciones");
  const otrosIngresos = sumCat("otros");

  // Spending by area (scenario + base), top 6 + rest.
  const byBuilding = buildings
    .map((b) => {
      const lines = spendingPolicies.filter((p) => p.building === b.id);
      return {
        id: b.id,
        label: b.short,
        value: lines.reduce((a, p) => a + (overrides[p.id] ?? p.amount), 0),
        base: lines.reduce((a, p) => a + p.amount, 0),
      };
    })
    .sort((a, b) => b.value - a.value);
  const topAreas = byBuilding.slice(0, 6);
  const rest = byBuilding.slice(6);
  const restValue = rest.reduce((a, b) => a + b.value, 0);
  const restBase = rest.reduce((a, b) => a + b.base, 0);

  const deficit = totals.balance < 0;

  return (
    <Panel title={`Situación económica · ${meta.baseYear}`} right={<EstimateBadge />} bodyClassName="space-y-2">
      {/* Ingresos */}
      <div className="space-y-0.5">
        <Row
          label="Ingresos"
          tone="moss"
          strong
          value={formatM(totals.revenue)}
          delta={totals.revenue - totals.baseRevenue}
          deltaMode="revenue"
        />
        <Row label="Impuestos" value={formatM(impuestos)} delta={impuestos - sumCatBase("tributos")} deltaMode="revenue" />
        <Row label="Cotizaciones sociales" value={formatM(cotizaciones)} delta={cotizaciones - sumCatBase("cotizaciones")} deltaMode="revenue" />
        <Row label="Otros ingresos" value={formatM(otrosIngresos)} delta={otrosIngresos - sumCatBase("otros")} deltaMode="revenue" />
      </div>

      {/* Gastos */}
      <div className="space-y-0.5 border-t border-bevel-dark/30 pt-2">
        <Row
          label="Gastos"
          tone="brick"
          strong
          value={formatM(totals.spending)}
          delta={totals.spending - totals.baseSpending}
          deltaMode="spending"
        />
        {topAreas.map((a) => (
          <Row
            key={a.id}
            label={buildingById(a.id)?.short ?? a.label}
            value={formatM(a.value)}
            delta={a.value - a.base}
            deltaMode="spending"
          />
        ))}
        {restValue > 0 && (
          <Row label="Resto de áreas" value={formatM(restValue)} delta={restValue - restBase} deltaMode="spending" />
        )}
      </div>

      {/* Saldo / déficit / deuda */}
      <div className="space-y-1 border-t-2 border-bevel-dark/50 pt-2">
        <div className="flex items-baseline justify-between">
          <span className={`font-chrome uppercase text-[10px] ${deficit ? "text-brick" : "text-moss"}`}>
            Saldo
          </span>
          <span className="flex items-baseline gap-1.5 whitespace-nowrap">
            {Math.abs(totals.balanceDelta) >= 0.5 && (
              <span className={`tnum font-data text-[9px] ${deltaClass(totals.balanceDelta, "balance")}`}>
                {signNum(totals.balanceDelta)}
              </span>
            )}
            <AnimatedNumber
              value={totals.balance}
              format={(n) => formatM(n, { sign: true })}
              className={`tnum font-data font-bold text-[14px] ${deficit ? "text-brick" : "text-moss"}`}
            />
          </span>
        </div>
        <Row
          label={deficit ? "Déficit público" : "Superávit público"}
          value={formatGdpPct(totals.balance, meta.gdp).replace("−", "")}
        />
        <Row label="Deuda pública" value={`${formatM(meta.publicDebt)} · ${formatPctValue(meta.publicDebtPct, 1)} PIB`} />
      </div>
    </Panel>
  );
}
