"use client";

import Link from "next/link";
import { useSim, isDirty } from "@/lib/store";
import { meta } from "@/lib/data";

export function TopBar() {
  const crt = useSim((s) => s.crt);
  const toggleCrt = useSim((s) => s.toggleCrt);
  const reset = useSim((s) => s.reset);
  const dirty = useSim(isDirty);

  return (
    <header className="panel">
      <div className="bg-teal-dark text-parchment px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-grid place-items-center w-8 h-8 bg-amber text-teal-dark bevel-out font-pixel text-[12px]"
          >
            €
          </span>
          <div className="leading-tight">
            <h1 className="pixel-title font-pixel text-parchment text-[12px] sm:text-[15px]">
              PRESUPUESTÓPOLIS
            </h1>
            <p className="font-chrome uppercase text-amber text-[9px] sm:text-[10px] tracking-wide">
              Simulación de los Presupuestos del Estado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-chrome uppercase text-[9px] bg-teal px-2 py-1 bevel-out-thin">
            Año base {meta.baseYear}
          </span>
          <span
            title="Proyecto no oficial. Sin relación con la AEAT ni con el Gobierno."
            className="font-chrome uppercase text-[9px] bg-brick text-parchment px-2 py-1 bevel-out-thin"
          >
            No oficial
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
            onClick={toggleCrt}
            data-active={crt}
            className="btn-retro text-[9px] py-1"
            title="Activar/desactivar el filtro CRT (scanlines)"
          >
            CRT
          </button>
          <Link href="/metodologia" className="btn-retro text-[9px] py-1 no-underline">
            Metodología
          </Link>
        </div>
      </div>
    </header>
  );
}
