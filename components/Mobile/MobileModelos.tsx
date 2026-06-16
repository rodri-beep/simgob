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
import { useAreas, baseShareOf, ORDERED_BUILDINGS, txtColor } from "./model";

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
  const reset = useSim((s) => s.reset);

  const { totals } = useSimResults();
  const { areas, totalSpending } = useAreas();
  const profile = usePolitics();

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
  const cmpLabel = activeCountry
    ? `${activeCountry.flag ?? ""} ${activeCountry.label}`.trim()
    : "Tu escenario";

  const amountById = Object.fromEntries(areas.map((a) => [a.id, a.amount]));

  return (
    <div className="p-3.5">
      <p className="text-[12px] text-ink-soft leading-relaxed mb-2.5">
        Adopta la estructura de gasto de otro país (mismo total) y su nivel de impuestos. Mira cómo
        se reorganiza la tarta y en qué te convierte.
      </p>

      {/* Country chips. */}
      <div className="grid grid-cols-2 gap-2">
        <Chip label="🇪🇸 España" active={spainActive} onClick={loadSpain} />
        {countryModels.map((c) => (
          <Chip
            key={c.id}
            label={`${c.flag ? c.flag + " " : ""}${c.label}`}
            active={active === c.id}
            onClick={() => loadCountry(c.id)}
          />
        ))}
      </div>

      {/* España real vs scenario — 100% structure, side by side. */}
      <div className="mt-3.5 bg-panel bevel-out border border-bevel-dark/40">
        <div className="bg-teal-dark text-parchment font-chrome uppercase text-[10px] tracking-wide px-2.5 py-1.5">
          Cómo se reparte el gasto · 100 %
        </div>
        <div className="p-3">
          <div className="flex gap-3 items-stretch">
            <StructureColumn
              title="🇪🇸 España real"
              titleColor="#4a4636"
              shareOf={(id) => baseShareOf(id, totals.baseSpending)}
              outlined={false}
            />
            <StructureColumn
              title={cmpLabel}
              titleColor="#194c4c"
              shareOf={(id) => (totalSpending > 0 ? (amountById[id] ?? 0) / totalSpending : 0)}
              outlined
            />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
            {ORDERED_BUILDINGS.map((id) => (
              <span key={id} className="flex items-center gap-1.5 text-[10px] text-ink-soft">
                <span
                  className="w-[9px] h-[9px] flex-none border border-black/20"
                  style={{ background: BUILDING_COLORS[id] }}
                />
                {buildingById(id)?.short ?? id}
              </span>
            ))}
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
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-chrome uppercase text-[10.5px] tracking-wide px-1.5 py-2.5 cursor-pointer border border-bevel-dark/50 text-ink"
      style={{ background: active ? "#e09a2d" : "#e7dec3", boxShadow: active ? BEVEL_OUT : BEVEL_IN }}
    >
      {label}
    </button>
  );
}

/** A vertical 100%-stacked column of COFOG functions. */
function StructureColumn({
  title,
  titleColor,
  shareOf,
  outlined,
}: {
  title: string;
  titleColor: string;
  shareOf: (id: (typeof ORDERED_BUILDINGS)[number]) => number;
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
        className="flex-none h-[40vh] min-h-[300px] flex flex-col gap-px"
        style={{
          border: `1px solid ${outlined ? "rgba(138,127,93,.55)" : "rgba(138,127,93,.35)"}`,
          boxShadow: outlined ? "0 0 0 1px rgba(224,154,45,.5)" : undefined,
        }}
      >
        {ORDERED_BUILDINGS.map((id) => {
          const share = shareOf(id);
          const color = BUILDING_COLORS[id];
          return (
            <div
              key={id}
              className="flex items-center justify-center overflow-hidden"
              style={{ height: `${(share * 100).toFixed(2)}%`, background: color }}
            >
              {share >= 0.07 && (
                <span
                  className="text-[8.5px] font-bold whitespace-nowrap"
                  style={{ color: txtColor(color) }}
                >
                  {Math.round(share * 100)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
