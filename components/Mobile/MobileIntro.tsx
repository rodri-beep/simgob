"use client";

import { useEffect, useState } from "react";
import { useSim } from "@/lib/store";
import { track } from "@/lib/analytics";

/** Shared with the desktop walkthrough so we never double-onboard a user. */
const SEEN_KEY = "simgob:intro:v1";

type Cast = "asesora" | "asesor";

interface Step {
  who: Cast;
  title: string;
  text: string;
}

const CAST: Record<Cast, { src: string; name: string; role: string; bg: string; fg: string }> = {
  asesora: { src: "/characters/asesora.webp", name: "Elena", role: "Asesora", bg: "#54633f", fg: "#f3ecd4" },
  asesor: { src: "/characters/asesor.webp", name: "Diego", role: "Hacienda", bg: "#226b6b", fg: "#f3ecd4" },
};

// Copy written for the PHONE: it points at the pinned saldo, the bottom tabs,
// the tap-to-adjust sheets and the Modelos screen — not the desktop menu/city.
const STEPS: Step[] = [
  {
    who: "asesora",
    title: "Bienvenido/a a SimGob",
    text: "Esta app es el presupuesto de todas las Administraciones Públicas (Estado, CCAA, ayuntamientos y Seguridad Social), datos de 2023. Simulador divulgativo y no oficial: las cifras son estimaciones ilustrativas.",
  },
  {
    who: "asesor",
    title: "El saldo, siempre arriba",
    text: "Arriba tienes fijo el Saldo —déficit o superávit— y su % del PIB. Se recalcula al instante con cada cambio. Abajo, las pestañas: Resumen, Gastos, Ingresos y Modelos.",
  },
  {
    who: "asesora",
    title: "La ciudad es el gasto",
    text: "En Resumen, cada edificio es una función de gasto y su altura indica cuánto se gasta. Toca un edificio para abrir sus partidas y recortarlas o ampliarlas con los sliders.",
  },
  {
    who: "asesor",
    title: "Gastos e Ingresos",
    text: "En Gastos, cada bloque es un área (la altura es su peso). En Ingresos, toca IRPF o Sociedades para mover los tipos; «¿y a ti?» calcula tu sueldo neto. Cualquier cambio mueve el saldo.",
  },
  {
    who: "asesora",
    title: "Prueba otros países",
    text: "En Modelos adoptas la estructura de gasto y el nivel de impuestos de otro país (Suecia, Alemania, EE. UU.…) y ves cómo se reorganiza la tarta y en qué te convierte.",
  },
  {
    who: "asesor",
    title: "Comparte tu plan",
    text: "¿Te convence tu presupuesto? Pulsa «Compartir mi plan» en Resumen para una imagen y un enlace con tu escenario. ¡Toma el mando!",
  },
];

function Portrait({ who }: { who: Cast }) {
  const c = CAST[who];
  const [err, setErr] = useState(false);
  return (
    <div className="shrink-0 w-28 h-28 bevel-out border border-bevel-dark/50 overflow-hidden bg-parchment-dark">
      {err ? (
        <div
          className="w-full h-full grid place-items-center"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <span className="font-pixel text-[24px]">{c.name[0]}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- small static avatar with onError fallback
        <img
          src={c.src}
          alt={`${c.name}, ${c.role}`}
          onError={() => setErr(true)}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}

/**
 * Phone-native walkthrough — a full-screen takeover inside the phone frame.
 * Auto-opens on first visit (sharing the desktop "seen" flag) and is reopened
 * from the "?" in the mobile app bar.
 */
export function MobileIntro() {
  const open = useSim((s) => s.introOpen);
  const setIntro = useSim((s) => s.setIntro);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setIntro(true);
    } catch {
      /* ignore */
    }
  }, [setIntro]);

  const close = (reason: "completed" | "skipped" = "skipped") => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    track(reason === "completed" ? "intro_completed" : "intro_skipped", {
      step: step + 1,
      total: STEPS.length,
      surface: "mobile",
    });
    setIntro(false);
    setStep(0);
  };

  if (!open) return null;

  const s = STEPS[step];
  const c = CAST[s.who];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="absolute inset-0 z-[45] flex flex-col paper-bg anim-sheet-fade">
      {/* Title bar. */}
      <div
        className="flex-none bg-olive-dark text-parchment font-chrome uppercase text-[10.5px] tracking-wide px-3 pb-2.5 flex items-center justify-between"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}
      >
        <span>¿Cómo funciona?</span>
        <span className="flex items-center gap-2">
          <span className="text-[9px] opacity-80">
            {step + 1}/{STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => close("skipped")}
            className="font-chrome uppercase text-[8.5px] bg-teal text-parchment border border-teal-dark px-2 py-1.5 cursor-pointer"
          >
            cerrar ✕
          </button>
        </span>
      </div>

      {/* Step body. */}
      <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto px-6 py-7 flex flex-col items-center text-center">
        <Portrait who={s.who} />
        <div className="font-chrome uppercase text-[9px] text-ink-soft mt-3.5">
          {c.name} · {c.role}
        </div>
        <h3 className="font-chrome uppercase text-[15px] text-ink mt-1 leading-snug">{s.title}</h3>
        <p className="text-[13px] text-ink-soft leading-relaxed mt-3 max-w-[320px]">{s.text}</p>
      </div>

      {/* Footer: progress dots + navigation. */}
      <div
        className="flex-none bg-panel border-t border-bevel-dark/30 px-5 pt-3.5"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-center gap-2 mb-3.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Paso ${i + 1}`}
              onClick={() => setStep(i)}
              className={`w-2.5 h-2.5 bevel-out-thin ${i === step ? "bg-amber" : "bg-parchment-dark"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => close("skipped")} className="btn-retro text-[11px] py-2">
            Saltar
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setStep((v) => Math.max(0, v - 1))}
              disabled={step === 0}
              className="btn-retro text-[11px] py-2 disabled:opacity-40"
            >
              ◂ Atrás
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={() => close("completed")}
                className="btn-retro text-[11px] py-2 bg-amber/30"
              >
                ¡Empezar! ▸
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
                className="btn-retro text-[11px] py-2"
              >
                Siguiente ▸
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
