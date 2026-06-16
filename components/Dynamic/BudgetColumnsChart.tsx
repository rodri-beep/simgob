"use client";

import { useMemo } from "react";
import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import {
  revenueLines,
  spendingPolicies,
  irpfData,
  isData,
  buildings,
} from "@/lib/data";
import { BUILDING_COLORS } from "@/lib/buildingColors";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { formatM } from "@/lib/engine/format";

const REV_META: Record<string, { color: string; short: string }> = {
  cotizaciones: { color: "#236a6a", short: "Cotiz." },
  irpf: { color: "#e09a2d", short: "IRPF" },
  iva: { color: "#cf6b2c", short: "IVA" },
  is: { color: "#5b6a3f", short: "IS" },
  otros_impuestos: { color: "#a83c2e", short: "Otros imp." },
  iiee: { color: "#4e7d3a", short: "IIEE" },
  transferencias: { color: "#7fb0c4", short: "Transf." },
  operaciones_financieras: { color: "#9a9078", short: "Financ." },
  patrimoniales: { color: "#cdbf90", short: "Patrim." },
  tasas: { color: "#8a7f5d", short: "Tasas" },
};

interface Seg {
  id: string;
  label: string;
  value: number;
  color: string;
}

// Layout (SVG user units).
const BAR_W = 104;
const COL1 = 46;
const COL2 = 232;
const TOP = 26;
const AREA_H = 232;
const BASE_Y = TOP + AREA_H;
const W = COL2 + BAR_W + 46;
const H = BASE_Y + 22;

export function BudgetColumnsChart() {
  const { irpf, is, totals } = useSimResults();
  const overrides = useSim((s) => s.spendingOverrides);

  const { revSegs, spendSegs, maxY } = useMemo(() => {
    const revAmount = (id: string, base: number) =>
      id === "irpf"
        ? base + irpfData.stateDeltaShare * irpf.delta
        : id === "is"
          ? base + isData.stateDeltaShare * is.delta
          : base;

    const revSegs: Seg[] = revenueLines
      .map((l) => ({
        id: l.id,
        label: l.label,
        value: revAmount(l.id, l.amount),
        color: REV_META[l.id]?.color ?? "#9a9078",
      }))
      .sort((a, b) => b.value - a.value);

    const byBuilding: Record<string, number> = {};
    for (const p of spendingPolicies) {
      byBuilding[p.building] = (byBuilding[p.building] ?? 0) + (overrides[p.id] ?? p.amount);
    }
    const spendSegs: Seg[] = buildings
      .map((b) => ({ id: b.id, label: b.short, value: byBuilding[b.id] ?? 0, color: BUILDING_COLORS[b.id] }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);

    const totalRev = revSegs.reduce((a, s) => a + s.value, 0);
    const totalSpend = spendSegs.reduce((a, s) => a + s.value, 0);
    return { revSegs, spendSegs, maxY: Math.max(totalRev, totalSpend, 1) };
  }, [irpf, is, overrides]);

  const yFor = (v: number) => BASE_Y - (v / maxY) * AREA_H;

  const renderColumn = (segs: Seg[], x: number) => {
    let cum = 0;
    return segs.map((s) => {
      const y0 = yFor(cum);
      cum += s.value;
      const y1 = yFor(cum);
      const h = y0 - y1;
      const shortName = REV_META[s.id]?.short ?? s.label;
      return (
        <g key={s.id}>
          <rect x={x} y={y1} width={BAR_W} height={Math.max(h, 0)} fill={s.color} stroke="#211f18" strokeWidth={0.4}>
            <title>{`${s.label}: ${formatM(s.value)}`}</title>
          </rect>
          {h > 13 && (
            <text
              x={x + BAR_W / 2}
              y={y1 + h / 2 + 3}
              textAnchor="middle"
              className="iso-amount"
              fontSize={h > 22 ? 8 : 7}
            >
              {shortName}
              {h > 30 ? ` · ${formatM(s.value)}` : ""}
            </text>
          )}
        </g>
      );
    });
  };

  const totalRev = revSegs.reduce((a, s) => a + s.value, 0);
  const totalSpend = spendSegs.reduce((a, s) => a + s.value, 0);
  const lower = Math.min(totalRev, totalSpend);
  const higher = Math.max(totalRev, totalSpend);
  const deficit = totalSpend > totalRev;

  return (
    <Panel title="Ingresos vs. gastos · a la misma escala" right={<EstimateBadge />}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* baseline */}
        <line x1={20} y1={BASE_Y} x2={W - 10} y2={BASE_Y} stroke="#8a7f5d" strokeWidth={1} />

        {/* columns */}
        {renderColumn(revSegs, COL1)}
        {renderColumn(spendSegs, COL2)}

        {/* totals */}
        <text x={COL1 + BAR_W / 2} y={yFor(totalRev) - 5} textAnchor="middle" className="iso-amount" fontSize={10} fontWeight={700}>
          {formatM(totalRev)}
        </text>
        <text x={COL2 + BAR_W / 2} y={yFor(totalSpend) - 5} textAnchor="middle" className="iso-amount" fontSize={10} fontWeight={700}>
          {formatM(totalSpend)}
        </text>

        {/* deficit / surplus gap */}
        <line
          x1={COL1}
          y1={yFor(lower)}
          x2={COL2 + BAR_W}
          y2={yFor(lower)}
          stroke={deficit ? "#a83c2e" : "#4e7d3a"}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {higher - lower > maxY * 0.012 && (
          <text
            x={(deficit ? COL2 : COL1) + BAR_W / 2}
            y={yFor(higher) + (yFor(lower) - yFor(higher)) / 2 + 3}
            textAnchor="middle"
            fontSize={8}
            className="iso-amount"
            style={{ fill: deficit ? "#a83c2e" : "#4e7d3a" }}
          >
            {deficit ? "déficit " : "superávit "}
            {formatM(higher - lower)}
          </text>
        )}

        {/* column captions */}
        <text x={COL1 + BAR_W / 2} y={BASE_Y + 14} textAnchor="middle" className="iso-label" fontSize={8}>
          INGRESOS
        </text>
        <text x={COL2 + BAR_W / 2} y={BASE_Y + 14} textAnchor="middle" className="iso-label" fontSize={8}>
          GASTOS
        </text>
      </svg>
      <p className="text-[9px] text-ink-soft leading-snug mt-1">
        Ingresos por tipo y gastos por área, a la misma escala. La diferencia entre columnas es el
        saldo. Pasa el cursor por cada bloque para ver su importe. Saldo:{" "}
        <b className={deficit ? "text-brick" : "text-moss"}>
          {formatM(totals.balance, { sign: true })}
        </b>
        .
      </p>
    </Panel>
  );
}
