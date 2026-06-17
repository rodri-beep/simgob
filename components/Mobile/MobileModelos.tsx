"use client";

import { useSim, isDirty } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import { usePolitics } from "@/lib/usePolitics";
import {
  aappBaseline,
  countryModels,
  spendingPolicies,
  irpfData,
  buildingById,
  meta,
} from "@/lib/data";
import { countrySpendingOverrides, countryTaxLevers } from "@/lib/intl";
import { BUILDING_COLORS } from "@/lib/buildingColors";
import { formatPct } from "@/lib/engine/format";
import { track } from "@/lib/analytics";
import { Flag } from "@/components/ui/Flag";
import { useAreas, baseAmountOf, ORDERED_BUILDINGS, txtColor } from "./model";
import { useState, type ReactNode } from "react";
import type { BuildingId } from "@/lib/engine/types";

const SPAIN_REV_PCT = aappBaseline.totalRevenue / aappBaseline.gdp;
const TOTAL_BASE = irpfData.brackets.reduce((a, b) => a + b.baseGeneral + b.baseSavings, 0);
const BASE_AVG_IRPF = irpfData.officialRevenue / TOTAL_BASE;

const BEVEL_OUT = "inset 2px 2px 0 0 #fbf6e2,inset -2px -2px 0 0 #8a7f5d";
const BEVEL_IN = "inset -2px -2px 0 0 #fbf6e2,inset 2px 2px 0 0 #8a7f5d";

export function MobileModelos() {
  const active = useSim((s) => s.countryTemplate);
  const dirty = useSim(isDirty);
  const setAllSpending = useSim((s) => s.setAllSpending);
  const setIrpfUniformRate = useSim((s) => s.setIrpfUniformRate);
  const setIsNominalRate = useSim((s) => s.setIsNominalRate);
  const setCountryTemplate = useSim((s) => s.setCountryTemplate);
  const setCompareCountry = useSim((s) => s.setCompareCountry);
  const reset = useSim((s) => s.reset);

  const { totals } = useSimResults();
  const { areas } = useAreas();
  const profile = usePolitics();

  // Focus filter: hide/show functions in the comparison chart; the visible ones
  // re-normalise to fill the column (100% of what's shown).
  const [hidden, setHidden] = useState<Set<BuildingId>>(new Set());
  const visibleIds = ORDERED_BUILDINGS.filter((id) => !hidden.has(id));
  const toggle = (id: BuildingId) => {
    track("compare_filter_toggled", { id });
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (ORDERED_BUILDINGS.length - next.size > 1) next.add(id); // keep ≥1 visible
      return next;
    });
  };

  // Chart scale: % (each column re-normalises to 100% of what's shown) or
  // absolute M€ on a shared scale (so one category's real size is comparable).
  const [mode, setMode] = useState<"pct" | "abs">("pct");

  const loadSpain = () => {
    track("country_template_reset");
    reset();
  };
  const loadCountry = (id: string) => {
    const country = countryModels.find((c) => c.id === id);
    if (!country) return;
    setAllSpending(countrySpendingOverrides(country, spendingPolicies));
    const { irpfDelta, isNominal } = countryTaxLevers(country, SPAIN_REV_PCT, BASE_AVG_IRPF);
    setIrpfUniformRate(irpfDelta);
    setIsNominalRate(isNominal);
    setCountryTemplate(id);
    track("country_template_loaded", { country: id });
  };

  const spainActive = active === null && !dirty;
  const activeCountry = countryModels.find((c) => c.id === active);
  const cmpTitle: ReactNode = activeCountry ? (
    <span className="inline-flex items-center gap-1">
      <Flag country={activeCountry.id} size={10} /> {activeCountry.label}
    </span>
  ) : (
    "Tu escenario"
  );

  const amountById = Object.fromEntries(areas.map((a) => [a.id, a.amount]));

  // Denominators: per-column visible total in % mode; the shared max in € mode
  // (so the taller column = more, and a single category is directly comparable).
  const esTotal = visibleIds.reduce((a, id) => a + baseAmountOf(id), 0);
  const coTotal = visibleIds.reduce((a, id) => a + (amountById[id] ?? 0), 0);
  const sharedMax = Math.max(esTotal, coTotal, 1);
  const esDenom = mode === "pct" ? esTotal : sharedMax;
  const coDenom = mode === "pct" ? coTotal : sharedMax;

  return (
    <div className="p-3.5">
      <p className="text-[12px] text-ink-soft leading-relaxed mb-2.5">
        Adopta la estructura de gasto de otro país (mismo total) y su nivel de impuestos. Mira cómo
        se reorganiza la tarta y en qué te convierte.
      </p>

      {/* Country chips. */}
      <div className="grid grid-cols-2 gap-2">
        <Chip flagId="es" label="España" active={spainActive} onClick={loadSpain} />
        {countryModels.map((c) => (
          <Chip
            key={c.id}
            flagId={c.id}
            label={c.label}
            active={active === c.id}
            onClick={() => loadCountry(c.id)}
          />
        ))}
      </div>

      {activeCountry && (
        <button
          type="button"
          onClick={() => {
            track("compare_opened", { country: activeCountry.id, surface: "mobile" });
            setCompareCountry(activeCountry.id);
          }}
          className="btn-retro text-[11px] py-2.5 mt-2.5 w-full justify-center flex items-center gap-2 bg-amber/30"
        >
          ↗ Comparar España vs {activeCountry.label}
        </button>
      )}

      {/* España real vs scenario — 100% structure, side by side. */}
      <div className="mt-3.5 bg-panel bevel-out border border-bevel-dark/40">
        <div className="bg-teal-dark text-parchment font-chrome uppercase text-[10px] tracking-wide px-2.5 py-1.5 flex items-center justify-between gap-2">
          <span>Cómo se reparte el gasto</span>
          <span className="flex gap-0.5">
            {(["pct", "abs"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  track("compare_chart_mode", { mode: m });
                }}
                aria-pressed={mode === m}
                className={`font-chrome text-[10px] px-2 py-0.5 border border-teal cursor-pointer ${
                  mode === m ? "bg-amber text-ink" : "bg-teal text-parchment"
                }`}
              >
                {m === "pct" ? "%" : "M€"}
              </button>
            ))}
          </span>
        </div>
        <div className="p-3">
          <div className="flex gap-3 items-stretch">
            <StructureColumn
              title={
                <span className="inline-flex items-center gap-1">
                  <Flag country="es" size={10} /> España real
                </span>
              }
              titleColor="#4a4636"
              amountOf={baseAmountOf}
              ids={visibleIds}
              denom={esDenom}
              mode={mode}
              outlined={false}
            />
            <StructureColumn
              title={cmpTitle}
              titleColor="#194c4c"
              amountOf={(id) => amountById[id] ?? 0}
              ids={visibleIds}
              denom={coDenom}
              mode={mode}
              outlined
            />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
            {ORDERED_BUILDINGS.map((id) => {
              const off = hidden.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-pressed={!off}
                  className={`flex items-center gap-1.5 text-[10px] cursor-pointer ${
                    off ? "text-ink-soft/45" : "text-ink-soft"
                  }`}
                >
                  <span
                    className="w-[11px] h-[11px] flex-none border border-black/20"
                    style={{
                      background: off ? "transparent" : BUILDING_COLORS[id],
                      boxShadow: off ? `inset 0 0 0 2px ${BUILDING_COLORS[id]}` : undefined,
                    }}
                  />
                  <span className={off ? "line-through" : ""}>{buildingById(id)?.short ?? id}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[9.5px] text-ink-soft/80 leading-snug">
              {mode === "abs"
                ? `Importes en M€ · misma escala${
                    hidden.size > 0 ? ` · ${visibleIds.length}/${ORDERED_BUILDINGS.length}` : ""
                  }`
                : hidden.size > 0
                  ? `Mostrando ${visibleIds.length} de ${ORDERED_BUILDINGS.length} · 100 % de lo visible`
                  : "Toca una categoría para enfocar la comparación"}
            </span>
            {hidden.size > 0 && (
              <button
                type="button"
                onClick={() => setHidden(new Set())}
                className="font-chrome uppercase text-[9px] text-teal cursor-pointer shrink-0"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* What it turns you into. */}
      <div className="mt-3 bg-panel bevel-out border border-bevel-dark/40">
        <div className="bg-teal-dark text-parchment font-chrome uppercase text-[10px] tracking-wide px-2.5 py-1.5">
          En qué te convierte
        </div>
        <div className="px-3 py-2.5 flex gap-3 items-start">
          <span aria-hidden className="text-[32px] leading-none">
            {profile.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-chrome uppercase text-[13px] leading-tight">{profile.label}</div>
            <p className="text-[11.5px] text-ink-soft leading-snug mt-0.5 mb-1.5">{profile.blurb}</p>
            <div className="flex justify-between items-baseline border-t border-bevel-dark/30 pt-1.5">
              <span className="text-[11px] text-ink-soft">Ingresos / PIB</span>
              <span className="tnum font-data text-[12px] font-bold">
                {formatPct(totals.revenue / meta.gdp, 1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[9.5px] text-ink-soft/80 leading-relaxed mt-2.5 mx-0.5">
        Estimación ilustrativa. Estructura de gasto por función (COFOG, Eurostat) e ingresos por
        presión fiscal (OCDE), perímetro de las Administraciones Públicas.
      </p>
    </div>
  );
}

function Chip({
  flagId,
  label,
  active,
  onClick,
}: {
  flagId?: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-chrome uppercase text-[10.5px] tracking-wide px-1.5 py-2.5 cursor-pointer border border-bevel-dark/50 text-ink flex items-center justify-center gap-1.5"
      style={{ background: active ? "#e09a2d" : "#e7dec3", boxShadow: active ? BEVEL_OUT : BEVEL_IN }}
    >
      {flagId && <Flag country={flagId} size={12} />}
      {label}
    </button>
  );
}

/** A vertical 100%-stacked column of COFOG functions. */
function StructureColumn({
  title,
  titleColor,
  amountOf,
  ids,
  denom,
  mode,
  outlined,
}: {
  title: ReactNode;
  titleColor: string;
  amountOf: (id: BuildingId) => number;
  ids: BuildingId[];
  /** Divisor for each segment's height: the column's visible total (%) or the shared max (€). */
  denom: number;
  mode: "pct" | "abs";
  outlined: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div
        className="font-chrome uppercase text-[8.5px] text-center mb-1.5"
        style={{ color: titleColor }}
      >
        {title}
      </div>
      <div
        className="flex-none h-[40vh] min-h-[300px] flex flex-col justify-end gap-px"
        style={{
          border: `1px solid ${outlined ? "rgba(138,127,93,.55)" : "rgba(138,127,93,.35)"}`,
          boxShadow: outlined ? "0 0 0 1px rgba(224,154,45,.5)" : undefined,
        }}
      >
        {ids.map((id) => {
          const amount = amountOf(id);
          const h = denom > 0 ? amount / denom : 0; // fraction of the container height
          const color = BUILDING_COLORS[id];
          return (
            <div
              key={id}
              className="flex items-center justify-center overflow-hidden transition-[height] duration-300 ease-out"
              style={{ height: `${(h * 100).toFixed(2)}%`, background: color }}
            >
              {h >= 0.07 && (
                <span
                  className="text-[8.5px] font-bold whitespace-nowrap px-1"
                  style={{ color: txtColor(color) }}
                >
                  {mode === "pct" ? `${Math.round(h * 100)}%` : Math.round(amount).toLocaleString("es-ES")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
