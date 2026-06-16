"use client";

import Link from "next/link";
import { useSimResults } from "@/lib/useSimResults";
import { usePolitics } from "@/lib/usePolitics";
import { revenueLines, meta, human } from "@/lib/data";
import { REPO_URL } from "@/lib/seo";
import { formatM, formatPctValue, formatEur } from "@/lib/engine/format";
import { useAreas, MAX_BASE, signNum } from "./model";
import type { BuildingId } from "@/lib/engine/types";

const CITY_BG = "linear-gradient(#bcd6e2,#cfe0d2)";

/** Deterministic lit/dark windows for a tower of `rows` rows. */
function windowsFor(index: number, rows: number): string[] {
  let seed = (index + 3) * 131;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: string[] = [];
  for (let w = 0; w < rows * 2; w++) out.push(rnd() > 0.45 ? "#f1c75a" : "#33352f");
  return out;
}

export function MobileResumen({
  onSpendArea,
  onShare,
}: {
  onSpendArea: (id: BuildingId) => void;
  onShare: () => void;
}) {
  const { totals } = useSimResults();
  const profile = usePolitics();
  const { areas } = useAreas();

  const deficit = totals.balance < 0;
  const balanceInk = deficit ? "#a83c2e" : "#4e7d3a";

  // P/L groupings (same as desktop, derived from the live totals).
  const cotizaciones = revenueLines
    .filter((l) => l.category === "cotizaciones")
    .reduce((a, l) => a + l.amount, 0);
  const otrosIngresos = revenueLines
    .filter((l) => l.category === "otros")
    .reduce((a, l) => a + l.amount, 0);
  const impuestos = totals.revenue - cotizaciones - otrosIngresos;

  const byAmount = [...areas].sort((a, b) => b.amount - a.amount);
  const top6 = byAmount.slice(0, 6);
  const rest = byAmount.slice(6);
  const restVal = rest.reduce((a, x) => a + x.amount, 0);
  const restBase = rest.reduce((a, x) => a + x.base, 0);

  const perHab = (totals.balance * 1e6) / human.constants.population;

  return (
    <div className="p-3.5">
      {/* KPIs (Ingresos / Gastos). The saldo lives in the pinned bar above. */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-parchment bevel-in border border-bevel-dark/30 px-3 py-2.5">
          <div className="font-chrome uppercase text-[8.5px] tracking-wide text-ink-soft">
            Ingresos
          </div>
          <div className="tnum font-data font-extrabold text-[19px] leading-tight text-moss">
            {formatM(totals.revenue)}
          </div>
          <div className="tnum font-data text-[9.5px] text-ink-soft/80">
            orig. {formatM(totals.baseRevenue)}
          </div>
        </div>
        <div className="bg-parchment bevel-in border border-bevel-dark/30 px-3 py-2.5">
          <div className="font-chrome uppercase text-[8.5px] tracking-wide text-ink-soft">
            Gastos
          </div>
          <div className="tnum font-data font-extrabold text-[19px] leading-tight text-brick">
            {formatM(totals.spending)}
          </div>
          <div className="tnum font-data text-[9.5px] text-ink-soft/80">
            orig. {formatM(totals.baseSpending)}
          </div>
        </div>
      </div>
      <div className="font-chrome uppercase text-[9px] tracking-wide text-ink-soft mt-2.5 mx-0.5">
        Saldo ≈{" "}
        <b className="font-data">{formatEur(perHab, { sign: true })}</b> por habitante
      </div>

      {/* City of spending — height ≈ spend, tap a building to adjust it. */}
      <div className="mt-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-chrome uppercase text-[10px] tracking-wide text-teal-dark">
            Tu ciudad del gasto · desliza →
          </span>
          <span className="font-chrome uppercase text-[8px] tracking-wide text-ink-soft">
            altura ≈ gasto
          </span>
        </div>
        <div
          className="no-scrollbar relative border border-bevel-dark/40 overflow-x-auto overflow-y-hidden"
          style={{ background: CITY_BG, boxShadow: "inset 2px 2px 0 0 rgba(0,0,0,.08)" }}
        >
          <div className="flex items-end gap-2.5 px-3 pt-3.5 h-[248px] w-max">
            {areas.map((a, i) => {
              const h = Math.round(34 + (a.amount / MAX_BASE) * 150);
              const rows = Math.max(1, Math.min(7, Math.floor((h - 12) / 14)));
              const wins = windowsFor(i, rows);
              const amountColor = a.modified
                ? a.delta < 0
                  ? "#4e7d3a"
                  : "#a83c2e"
                : "#4a4636";
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSpendArea(a.id)}
                  className="flex-none flex flex-col items-center self-end bg-transparent border-0 p-0 cursor-pointer"
                >
                  <div
                    className="bg-bevel-light border border-bevel-dark mb-[3px] px-1 py-0.5 whitespace-nowrap"
                    style={{ boxShadow: "1px 1px 0 0 rgba(0,0,0,.2)" }}
                  >
                    <div className="font-chrome uppercase text-[7px] text-ink leading-tight">
                      {a.short}
                    </div>
                    <div className="tnum font-data text-[8.5px] font-bold" style={{ color: amountColor }}>
                      {formatM(a.amount)}
                    </div>
                  </div>
                  <div
                    className="relative w-12 flex flex-col-reverse flex-wrap gap-[3px] content-start"
                    style={{
                      height: `${h}px`,
                      background: a.color,
                      border: `1px solid ${a.edge}`,
                      boxShadow: "inset -6px 0 0 0 rgba(0,0,0,.16)",
                      padding: "5px 4px",
                    }}
                  >
                    {wins.map((w, wi) => (
                      <span key={wi} className="w-[7px] h-[6px]" style={{ background: w }} />
                    ))}
                    {a.modified && (
                      <span
                        className="absolute -top-[3px] -right-[3px] w-[9px] h-[9px] rounded-full border-[1.5px] border-bevel-light"
                        style={{ background: a.delta < 0 ? "#4e7d3a" : "#a83c2e" }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="h-4" style={{ background: "#6f8a4e", borderTop: "2px solid #566b3c" }} />
        </div>
        <p className="text-[11.5px] text-ink-soft leading-relaxed mt-2 mx-0.5">
          Toca un edificio para ir a ajustarlo. La altura se actualiza con tus recortes y subidas.
        </p>
      </div>

      {/* Political profile — above the P/L (per the user's brief). */}
      <div className="mt-3.5 bg-panel bevel-out border border-bevel-dark/40">
        <div className="bg-teal-dark text-parchment font-chrome uppercase text-[10px] tracking-wide px-2.5 py-1.5">
          Tu perfil político
        </div>
        <div className="px-3 py-2.5 flex gap-3 items-start">
          <span aria-hidden className="text-[32px] leading-none">
            {profile.emoji}
          </span>
          <div className="min-w-0">
            <div className="font-chrome uppercase text-[13px] leading-tight">{profile.label}</div>
            <p className="text-[11.5px] text-ink-soft leading-snug mt-0.5">{profile.blurb}</p>
            {profile.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {profile.reasons.map((r) => (
                  <span
                    key={r}
                    className="font-chrome uppercase text-[8px] tracking-wide bg-parchment-dark text-ink-soft border border-bevel-dark/40 px-1.5 py-[3px] leading-none"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* P/L summary. */}
      <div className="mt-3 bg-panel bevel-out border border-bevel-dark/40">
        <div className="bg-teal-dark text-parchment font-chrome uppercase text-[10px] tracking-wide px-2.5 py-1.5 flex justify-between">
          <span>Situación económica · {meta.baseYear}</span>
          <span className="text-amber">▲</span>
        </div>
        <div className="px-3 py-2.5">
          <Row label="Ingresos" value={formatM(totals.revenue)} strong tone="moss" />
          <Row label="Impuestos" value={formatM(impuestos)} />
          <Row label="Cotizaciones sociales" value={formatM(cotizaciones)} />
          <Row label="Otros ingresos" value={formatM(otrosIngresos)} />
          <div className="border-t border-bevel-dark/35 my-2.5" />
          <Row label="Gastos" value={formatM(totals.spending)} strong tone="brick" />
          {top6.map((a) => (
            <Row
              key={a.id}
              label={a.short}
              value={formatM(a.amount)}
              delta={a.delta}
            />
          ))}
          {restVal > 0 && (
            <Row label="Resto de áreas" value={formatM(restVal)} delta={restVal - restBase} />
          )}
          <div className="border-t-2 border-bevel-dark/50 my-2.5" />
          <div className="flex items-baseline justify-between">
            <span className="font-chrome uppercase text-[9.5px]" style={{ color: balanceInk }}>
              Saldo
            </span>
            <span
              className="tnum font-data font-extrabold text-[15px]"
              style={{ color: balanceInk }}
            >
              {formatM(totals.balance, { sign: true })}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[12px] text-ink-soft">Deuda pública</span>
            <span className="tnum font-data text-[12px]">
              {formatM(meta.publicDebt)} · {formatPctValue(meta.publicDebtPct, 1)} PIB
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onShare}
        className="mt-3.5 w-full font-chrome uppercase text-[11px] tracking-wide bg-teal text-parchment border border-teal-dark px-3 py-3 cursor-pointer"
        style={{
          boxShadow:
            "inset 2px 2px 0 0 rgba(255,255,255,.25), inset -2px -2px 0 0 rgba(0,0,0,.25)",
        }}
      >
        ↗ Compartir mi plan
      </button>

      {/* About / methodology — mirrors the desktop footer links. */}
      <div className="mt-4 pt-3 border-t border-bevel-dark/30 text-center">
        <div className="flex justify-center gap-4">
          <Link
            href="/metodologia"
            className="font-chrome uppercase text-[9px] tracking-wide text-teal-dark underline"
          >
            Metodología
          </Link>
          <Link
            href="/faq"
            className="font-chrome uppercase text-[9px] tracking-wide text-teal-dark underline"
          >
            Preguntas frecuentes
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-chrome uppercase text-[9px] tracking-wide text-teal-dark underline"
          >
            GitHub
          </a>
        </div>
        <p className="text-[9px] text-ink-soft/70 leading-relaxed mt-2">
          Proyecto no oficial · estimaciones ilustrativas · datos AAPP {meta.baseYear} · un proyecto
          de Desvent
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  tone = "ink",
  delta,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "ink" | "moss" | "brick";
  delta?: number;
}) {
  const color = tone === "moss" ? "text-moss" : tone === "brick" ? "text-brick" : "text-ink";
  const showDelta = delta !== undefined && Math.abs(delta) >= 0.5;
  return (
    <div className="flex items-baseline justify-between mt-0.5 first:mt-0">
      {strong ? (
        <span className={`font-chrome uppercase text-[9.5px] ${color}`}>{label}</span>
      ) : (
        <span className="text-[12px] text-ink-soft">{label}</span>
      )}
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        {showDelta && (
          <span
            className={`tnum font-data text-[9.5px] ${delta! < 0 ? "text-moss" : "text-brick"}`}
          >
            {signNum(delta!)}
          </span>
        )}
        <span
          className={`tnum font-data ${strong ? "font-extrabold text-[14px] " + color : "text-[12px] text-ink"}`}
        >
          {value}
        </span>
      </span>
    </div>
  );
}
