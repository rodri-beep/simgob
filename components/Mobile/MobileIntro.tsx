"use client";

import { useEffect } from "react";
import { useSim } from "@/lib/store";
import { track } from "@/lib/analytics";
import { FIRST_MOVES, runFirstMove, type FirstMove } from "@/lib/firstMoves";
import type { MobileTab } from "./model";

/** Shared with the desktop walkthrough so we never double-onboard a user. */
const SEEN_KEY = "simgob:intro:v1";

/**
 * Phone-native first run — an action-first takeover. Instead of a passive tour
 * (which the launch data showed users frantically clicking past), it pushes the
 * visitor to create their first scenario in one tap and drops them into it.
 * Auto-opens on first visit; reopened from the "?" in the app bar.
 */
export function MobileIntro({ onPick }: { onPick: (tab?: MobileTab) => void }) {
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
    runFirstMove(m, "mobile");
    onPick(m.tab as MobileTab);
  };
  const skip = () => {
    markSeen();
    track("intro_skipped", { surface: "mobile", mode: "first_move" });
    onPick(undefined);
  };

  return (
    <div className="absolute inset-0 z-[45] flex flex-col paper-bg anim-sheet-fade">
      {/* Title bar. */}
      <div
        className="flex-none bg-olive-dark text-parchment font-chrome uppercase text-[10.5px] tracking-wide px-3 pb-2.5 flex items-center justify-between"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}
      >
        <span>Empieza a gobernar</span>
        <button
          type="button"
          onClick={skip}
          className="font-chrome uppercase text-[8.5px] bg-teal text-parchment border border-teal-dark px-2 py-1.5 cursor-pointer"
        >
          cerrar ✕
        </button>
      </div>

      {/* Body: one-line what-is + the first-move chooser. */}
      <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto px-5 py-6">
        <p className="text-[13px] text-ink-soft leading-relaxed text-center max-w-[340px] mx-auto">
          SimGob es el presupuesto de las Administraciones Públicas (2023). Tú mueves las palancas y
          ves al instante el efecto en el saldo. <b className="text-ink">Elige tu primera jugada:</b>
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {FIRST_MOVES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => pick(m)}
              className={`w-full text-left bg-panel bevel-out border border-bevel-dark/50 px-3.5 py-3 cursor-pointer flex items-center gap-3 ${
                i === 0 ? "anim-hint-pulse" : ""
              }`}
            >
              <span aria-hidden className="text-[26px] leading-none shrink-0">
                {m.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-chrome uppercase text-[12px] text-ink leading-tight">
                  {m.label}
                </span>
                <span className="block text-[11px] text-ink-soft leading-snug mt-0.5">{m.sub}</span>
              </span>
              <span aria-hidden className="font-chrome text-[15px] text-amber shrink-0">
                ▸
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={skip}
          className="btn-retro text-[11px] py-2 mt-5 w-full justify-center flex"
        >
          Prefiero explorar por mi cuenta
        </button>
        <p className="text-[9px] text-ink-soft/70 text-center mt-3">
          No oficial · estimación ilustrativa
        </p>
      </div>
    </div>
  );
}
