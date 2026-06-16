"use client";

import { useMemo, useState } from "react";
import { aappBaseline, countryModels } from "@/lib/data";
import { COFOG, spainResult, applyCountry, type ModelResult } from "@/lib/intl";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { formatM, formatPct, formatGdpPct } from "@/lib/engine/format";

const COLOR = Object.fromEntries(COFOG.map((c) => [c.id, c.color]));
const SHORT = Object.fromEntries(COFOG.map((c) => [c.id, c.short]));
const LABEL = Object.fromEntries(COFOG.map((c) => [c.id, c.label]));

interface Col {
  title: string;
  total: number;
  segments: { id: string; label: string; short: string; value: number; color: string }[];
}

const TOP = 24;
const AREA_H = 220;
const BASE_Y = TOP + AREA_H;
const COLW = 96;
const GAP = 34;
const X0 = 50;

export function IntlComparePanel() {
  const [sel, setSel] = useState("espana");
  const spain = useMemo(() => spainResult(aappBaseline), []);
  const country = countryModels.find((c) => c.id === sel);
  const model: ModelResult = country ? applyCountry(aappBaseline, country) : spain;

  const cols: Col[] = useMemo(() => {
    const revColor = "#236a6a";
    const spendCols = (title: string, r: ModelResult): Col => ({
      title,
      total: r.totalSpending,
      segments: [...r.spending]
        .sort((a, b) => b.value - a.value)
        .map((s) => ({ id: s.id, label: LABEL[s.id], short: SHORT[s.id], value: s.value, color: COLOR[s.id] })),
    });
    const revCol = (title: string, value: number): Col => ({
      title,
      total: value,
      segments: [{ id: "rev", label: "Ingresos", short: "Ingresos", value, color: revColor }],
    });

    if (!country) {
      return [revCol("Ingresos", spain.revenue), spendCols("Gastos", spain)];
    }
    return [
      revCol("Ingresos", model.revenue),
      spendCols("Gasto España", spain),
      spendCols(`Gasto con ${country.label}`, model),
    ];
  }, [country, model, spain]);

  const maxY = Math.max(...cols.map((c) => c.total), 1);
  const yFor = (v: number) => BASE_Y - (v / maxY) * AREA_H;
  const W = X0 + cols.length * (COLW + GAP);
  const H = BASE_Y + 24;

  return (
    <Panel title="Comparar con otro país · Administraciones Públicas" right={<EstimateBadge />}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-chrome uppercase text-[10px] text-ink-soft">País modelo</span>
        <select
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="panel-inset font-data text-[12px] text-ink px-2 py-1 bg-parchment"
        >
          <option value="espana">🇪🇸 España (real)</option>
          {countryModels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flag ? `${c.flag} ` : ""}
              {c.label}
            </option>
          ))}
        </select>
        {country && (
          <span className="font-chrome uppercase text-[9px] text-ink-soft">
            ingresos públicos {formatPct(country.revenuePctGdp, 0)} del PIB · impuestos{" "}
            {formatPct(country.taxToGdp, 0)}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <line x1={20} y1={BASE_Y} x2={W - 10} y2={BASE_Y} stroke="#8a7f5d" strokeWidth={1} />
        {cols.map((col, ci) => {
          const x = X0 + ci * (COLW + GAP);
          let cum = 0;
          return (
            <g key={ci}>
              {col.segments.map((s) => {
                const y0 = yFor(cum);
                cum += s.value;
                const y1 = yFor(cum);
                const h = y0 - y1;
                return (
                  <g key={s.id}>
                    <rect x={x} y={y1} width={COLW} height={Math.max(h, 0)} fill={s.color} stroke="#211f18" strokeWidth={0.4}>
                      <title>{`${s.label}: ${formatM(s.value)}`}</title>
                    </rect>
                    {h > 14 && (
                      <text x={x + COLW / 2} y={y1 + h / 2 + 3} textAnchor="middle" className="iso-amount" fontSize={h > 24 ? 8 : 7}>
                        {s.short}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={x + COLW / 2} y={yFor(col.total) - 5} textAnchor="middle" className="iso-amount" fontSize={9} fontWeight={700}>
                {formatM(col.total)}
              </text>
              <text x={x + COLW / 2} y={BASE_Y + 14} textAnchor="middle" className="iso-label" fontSize={7.5}>
                {col.title.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">
            Saldo {country ? `con ${country.label}` : "España"}
          </div>
          <div className={`tnum font-data font-bold ${model.balance < 0 ? "text-brick" : "text-moss"}`}>
            {formatM(model.balance, { sign: true })} · {formatGdpPct(model.balance, aappBaseline.gdp)}
          </div>
        </div>
        <div className="panel-inset px-2 py-1">
          <div className="font-chrome uppercase text-[8px] text-ink-soft">Saldo España (real)</div>
          <div className={`tnum font-data font-bold ${spain.balance < 0 ? "text-brick" : "text-moss"}`}>
            {formatM(spain.balance, { sign: true })} · {formatGdpPct(spain.balance, aappBaseline.gdp)}
          </div>
        </div>
      </div>

      <p className="mt-1.5 text-[9px] text-ink-soft leading-snug">
        Administraciones Públicas (todos los niveles), no el perímetro PGE editable. El gasto es el
        total español repartido como en el país elegido (misma tarta, otras porciones); los ingresos
        son el PIB español × sus ingresos públicos (% PIB). Estimación ilustrativa · COFOG
        (Eurostat) y OCDE, 2023.
      </p>
    </Panel>
  );
}
