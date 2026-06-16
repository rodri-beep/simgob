"use client";

import Link from "next/link";
import { useSim, isDirty } from "@/lib/store";
import { meta } from "@/lib/data";
import { track } from "@/lib/analytics";

export function TopBar() {
  const reset = useSim((s) => s.reset);
  const setIntro = useSim((s) => s.setIntro);
  const setShare = useSim((s) => s.setShareOpen);
  const dirty = useSim(isDirty);

  const share = () => {
    track("scenario_shared", { dirty, source: "desktop" });
    setShare(true);
  };

  return (
    <header className="panel">
      <div className="bg-teal-dark text-parchment px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-grid place-items-center w-8 h-8 bg-amber text-teal-dark bevel-out font-pixel text-[10px]"
          >
            SG
          </span>
          <div className="leading-tight">
            <h1 className="pixel-title font-pixel text-[13px] sm:text-[16px]">
              <span className="text-parchment">SIM</span>
              <span className="text-amber">GOB</span>
            </h1>
            <p className="font-chrome uppercase text-amber text-[9px] sm:text-[10px] tracking-wide">
              Gobierna · Decide · Cuadra las cuentas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-chrome uppercase text-[9px] bg-teal px-2 py-1 bevel-out-thin">
            Año base {meta.baseYear}
          </span>
          <button
            type="button"
            onClick={reset}
            data-active={dirty}
            className="btn-retro text-[9px] py-1"
            title="Volver al escenario oficial (deshacer todos los cambios)"
          >
            ↺ Escenario real
          </button>
          <button
            type="button"
            onClick={share}
            className="btn-retro text-[9px] py-1"
            title="Compartir tu plan: imagen + enlace"
          >
            ↗ Compartir
          </button>
          <button
            type="button"
            onClick={() => {
              track("help_opened");
              setIntro(true);
            }}
            className="btn-retro text-[9px] py-1"
            title="Cómo funciona (tutorial)"
          >
            ? Cómo funciona
          </button>
          <Link href="/metodologia" className="btn-retro text-[9px] py-1 no-underline">
            Metodología
          </Link>
        </div>
      </div>
    </header>
  );
}
