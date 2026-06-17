"use client";

import { useEffect } from "react";
import { useSim } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { track } from "@/lib/analytics";
import { FIRST_MOVES, runFirstMove, type FirstMove } from "@/lib/firstMoves";

/** Shared with the phone walkthrough so we never double-onboard a user. */
const SEEN_KEY = "simgob:intro:v1";

/**
 * Desktop first run — an action-first chooser. Picking a move applies the first
 * scenario and, for tax moves, opens the Impuestos modal so the effect is right
 * there. Auto-opens on first visit; reopened from "? Cómo funciona".
 */
export function IntroModal() {
  const open = useSim((s) => s.introOpen);
  const setIntro = useSim((s) => s.setIntro);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setIntro(true);
    } catch {
      /* ignore */
    }
  }, [setIntro]);

  if (!open) return null;

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const pick = (m: FirstMove) => {
    markSeen();
    runFirstMove(m, "desktop");
    setIntro(false);
    if (m.desktopRevenue) {
      const s = useSim.getState();
      s.setActiveRevenue(m.desktopRevenue);
      s.setImpuestosOpen(true);
    }
  };
  const skip = () => {
    markSeen();
    track("intro_skipped", { surface: "desktop", mode: "first_move" });
    setIntro(false);
  };

  return (
    <Modal title="Empieza a gobernar" onClose={skip} maxWidth="max-w-lg">
      <p className="text-[12px] text-ink-soft leading-relaxed">
        SimGob es el presupuesto de las Administraciones Públicas (2023). Mueve las palancas —
        impuestos y gasto— y mira al instante el efecto sobre el saldo.{" "}
        <b className="text-ink">Elige tu primera jugada:</b>
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {FIRST_MOVES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => pick(m)}
            className={`w-full text-left bg-panel bevel-out border border-bevel-dark/50 px-3 py-2.5 cursor-pointer flex items-center gap-3 ${
              i === 0 ? "anim-hint-pulse" : ""
            }`}
          >
            <span aria-hidden className="text-[24px] leading-none shrink-0">
              {m.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-chrome uppercase text-[11px] text-ink leading-tight">
                {m.label}
              </span>
              <span className="block text-[11px] text-ink-soft leading-snug mt-0.5">{m.sub}</span>
            </span>
            <span aria-hidden className="font-chrome text-[14px] text-amber shrink-0">
              ▸
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button type="button" onClick={skip} className="btn-retro text-[10px]">
          Explorar por mi cuenta
        </button>
        <span className="font-chrome uppercase text-[8px] text-ink-soft/70">
          No oficial · estimación ilustrativa
        </span>
      </div>
    </Modal>
  );
}
