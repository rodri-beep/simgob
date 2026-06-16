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

function Row({ label, value, strong, tone = "ink" }: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "ink" | "moss" | "brick";
}) {
  const color = tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  return (
    <div className={`flex items-baseline justify-between gap-2 ${strong ? "" : "text-ink-soft"}`}>
      <span className={`${strong ? "font-chrome uppercase text-[10px] " + color : "font-data text-[11px]"}`}>
        {label}
      </span>
      <span className={`tnum font-data ${strong ? "font-bold text-[13px] " + color : "text-[11px] text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

export function PLPanel() {
  const { irpf, is, totals } = useSimResults();
  const overrides = useSim((s) => s.spendingOverrides);

  // Revenue grouped (with the scenario for IRPF/IS).
  const lineScenario = (id: string, amount: number) =>
    id === "irpf"
      ? amount + irpfData.stateDeltaShare * irpf.delta
      : id === "is"
        ? amount + isData.stateDeltaShare * is.delta
        : amount;
  const sumCat = (cat: string) =>
    revenueLines.filter((l) => l.category === cat).reduce((a, l) => a + lineScenario(l.id, l.amount), 0);
  const impuestos = sumCat("tributos");
  const cotizaciones = sumCat("cotizaciones");
  const otrosIngresos = sumCat("otros");

  // Spending by area (scenario), top 6 + rest.
  const byBuilding = buildings
    .map((b) => ({
      id: b.id,
      label: b.short,
      value: spendingPolicies
        .filter((p) => p.building === b.id)
        .reduce((a, p) => a + (overrides[p.id] ?? p.amount), 0),
    }))
    .sort((a, b) => b.value - a.value);
  const topAreas = byBuilding.slice(0, 6);
  const restAreas = byBuilding.slice(6).reduce((a, b) => a + b.value, 0);

  const deficit = totals.balance < 0;

  return (
    <Panel title={`Situación económica · ${meta.baseYear}`} right={<EstimateBadge />} bodyClassName="space-y-2">
      {/* Ingresos */}
      <div className="space-y-0.5">
        <Row label="Ingresos" tone="moss" strong value={formatM(totals.revenue)} />
        <Row label="Impuestos" value={formatM(impuestos)} />
        <Row label="Cotizaciones sociales" value={formatM(cotizaciones)} />
        <Row label="Otros ingresos" value={formatM(otrosIngresos)} />
      </div>

      {/* Gastos */}
      <div className="space-y-0.5 border-t border-bevel-dark/30 pt-2">
        <Row label="Gastos" tone="brick" strong value={formatM(totals.spending)} />
        {topAreas.map((a) => (
          <Row key={a.id} label={buildingById(a.id)?.short ?? a.label} value={formatM(a.value)} />
        ))}
        {restAreas > 0 && <Row label="Resto de áreas" value={formatM(restAreas)} />}
      </div>

      {/* Saldo / déficit / deuda */}
      <div className="space-y-1 border-t-2 border-bevel-dark/50 pt-2">
        <div className="flex items-baseline justify-between">
          <span className={`font-chrome uppercase text-[10px] ${deficit ? "text-brick" : "text-moss"}`}>
            Saldo
          </span>
          <AnimatedNumber
            value={totals.balance}
            format={(n) => formatM(n, { sign: true })}
            className={`tnum font-data font-bold text-[14px] ${deficit ? "text-brick" : "text-moss"}`}
          />
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
