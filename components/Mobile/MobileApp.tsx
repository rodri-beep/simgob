"use client";

import { useState } from "react";
import { useSim, isDirty } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import { countryModels, meta } from "@/lib/data";
import { formatM, formatGdpPct } from "@/lib/engine/format";
import { track } from "@/lib/analytics";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { MobileResumen } from "./MobileResumen";
import { MobileGastos } from "./MobileGastos";
import { MobileIngresos } from "./MobileIngresos";
import { MobileModelos } from "./MobileModelos";
import { MobileSheet } from "./MobileSheet";
import { MobileIntro } from "./MobileIntro";
import type { MobileTab, SheetState } from "./model";
import type { BuildingId } from "@/lib/engine/types";

const TABS: { id: MobileTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "gastos", label: "Gastos" },
  { id: "ingresos", label: "Ingresos" },
  { id: "modelos", label: "Modelos" },
];

/**
 * The phone-first SimGob app (shown below `lg`). It drives the SAME store and
 * engine as the desktop layout — only the presentation changes: one task per
 * screen, a balance pinned at all times, and a bottom tab bar.
 */
export function MobileApp() {
  const [tab, setTab] = useState<MobileTab>("resumen");
  const [sheet, setSheet] = useState<SheetState>(null);

  const { totals } = useSimResults();
  const dirty = useSim(isDirty);
  const countryTemplate = useSim((s) => s.countryTemplate);
  const reset = useSim((s) => s.reset);
  const setShareOpen = useSim((s) => s.setShareOpen);
  const setIntro = useSim((s) => s.setIntro);

  const deficit = totals.balance < 0;
  const balColor = deficit ? "#e8a89b" : "#bfe0a8";

  let scenarioName = "Escenario real";
  if (countryTemplate) {
    const c = countryModels.find((x) => x.id === countryTemplate);
    scenarioName = c ? `Modelo ${c.label}` : "Tu escenario";
  } else if (dirty) {
    scenarioName = "Tu escenario";
  }

  const openSpendArea = (id: BuildingId) => {
    setTab("gastos");
    setSheet({ t: "spend", id });
  };
  const share = () => {
    track("scenario_shared", { dirty });
    setShareOpen(true);
  };

  return (
    <div className="phone-backdrop min-h-[100dvh] flex justify-center text-ink">
      <div className="relative w-full max-w-[480px] h-[100dvh] flex flex-col bg-parchment overflow-hidden shadow-2xl">
        {/* App bar. */}
        <div
          className="flex-none bg-teal-dark text-parchment px-4 pb-2.5 flex items-center justify-between"
          style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-grid place-items-center w-7 h-7 bg-amber text-teal-dark bevel-out font-pixel text-[9px]"
            >
              SG
            </span>
            <span className="font-pixel text-[13px]">
              <span className="text-parchment">SIM</span>
              <span className="text-amber">GOB</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-chrome uppercase text-[8.5px] tracking-wide bg-amber text-ink px-1.5 py-1 bevel-out-thin">
              ▲ Ilustrativa
            </span>
            <button
              type="button"
              onClick={() => {
                track("help_opened", { surface: "mobile" });
                setIntro(true);
              }}
              aria-label="Cómo funciona"
              className="font-chrome text-[12px] w-7 h-7 grid place-items-center bg-teal text-parchment border border-teal-dark bevel-out-thin cursor-pointer"
            >
              ?
            </button>
          </div>
        </div>

        {/* Pinned balance — always visible while you tweak. */}
        <div className="flex-none bg-olive-dark text-parchment px-4 pt-2.5 pb-3 flex items-center gap-3">
          <div className="flex-1 min-w-0" style={{ color: balColor }}>
            <div className="font-chrome uppercase text-[8.5px] tracking-wider text-parchment/65">
              {deficit ? "Saldo (déficit)" : "Saldo (superávit)"}
            </div>
            <AnimatedNumber
              value={totals.balance}
              format={(n) => formatM(n, { sign: true })}
              className="block tnum font-data font-extrabold text-[28px] leading-none"
            />
          </div>
          <div className="text-right flex-none">
            <div className="tnum text-[14px] font-bold" style={{ color: balColor }}>
              <AnimatedNumber value={totals.balance} format={(n) => formatGdpPct(n, meta.gdp)} />
            </div>
            <div className="font-chrome uppercase text-[8px] tracking-wide text-parchment/60">
              {scenarioName}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            title="Volver al escenario real"
            className="flex-none font-chrome text-[12px] w-8 h-8 bg-teal text-parchment border border-teal-dark cursor-pointer bevel-out-thin"
          >
            ↺
          </button>
        </div>
        <div className="flex-none h-[3px] bg-teal w-full" />

        {/* Scrolling content — one task per screen. */}
        <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto paper-bg">
          {tab === "resumen" && <MobileResumen onSpendArea={openSpendArea} onShare={share} />}
          {tab === "gastos" && (
            <MobileGastos onAdjust={(id) => setSheet({ t: "spend", id })} />
          )}
          {tab === "ingresos" && <MobileIngresos onAdjust={(s) => setSheet(s)} />}
          {tab === "modelos" && <MobileModelos />}
        </div>

        {/* Bottom tab bar. */}
        <div
          className="flex-none flex bg-parchment-dark border-t border-bevel-dark"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {TABS.map((t) => {
            const activeTab = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 border-0 px-0.5 pt-2.5 pb-3 cursor-pointer font-chrome uppercase text-[9.5px] tracking-wide ${
                  activeTab ? "bg-parchment text-ink font-bold" : "bg-transparent text-ink-soft/80"
                }`}
                style={{ borderTop: `3px solid ${activeTab ? "#e09a2d" : "transparent"}` }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Adjustment sheet over the app. */}
        {sheet && <MobileSheet sheet={sheet} onClose={() => setSheet(null)} />}

        {/* Phone-native onboarding (auto on first visit; "?" to reopen). */}
        <MobileIntro />
      </div>
    </div>
  );
}
