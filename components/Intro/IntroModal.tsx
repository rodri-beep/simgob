"use client";

import { useEffect, useState } from "react";
import { useSim } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";

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

const STEPS: Step[] = [
  {
    who: "asesora",
    title: "Bienvenido/a a SimGob",
    text: "Esta ciudad es el gasto de todas las Administraciones Públicas (Estado, CCAA, ayuntamientos y Seguridad Social), datos de 2023. Es un simulador divulgativo y no oficial: todas las cifras son estimaciones ilustrativas.",
  },
  {
    who: "asesor",
    title: "La ciudad es el gasto",
    text: "Cada edificio es una función de gasto y su altura —por plantas— indica cuánto se gasta. Sanidad y Educación salen a tamaño real porque incluyen lo que ejecutan las CCAA. Pulsa un edificio para recortar o ampliar.",
  },
  {
    who: "asesora",
    title: "Tú decides los impuestos",
    text: "Pulsa «Impuestos» en el menú para mover el IRPF y el Impuesto sobre Sociedades. Verás la recaudación y quién gana o pierde por tramo.",
  },
  {
    who: "asesor",
    title: "Vigila el saldo",
    text: "Arriba están Ingresos, Gastos y el Saldo (déficit o superávit) y su % del PIB. Se recalcula al instante con cada cambio.",
  },
  {
    who: "asesora",
    title: "De números a personas",
    text: "Cada cifra se traduce en historias: la pensión media, tu sueldo neto… Escribe tu salario en «¿y a ti?» y te lo cuento.",
  },
  {
    who: "asesor",
    title: "Comparte tu plan",
    text: "¿Te convence tu presupuesto? Pulsa «Compartir» para copiar un enlace con tu escenario. ¡Toma el mando!",
  },
];

function Portrait({ who }: { who: Cast }) {
  const c = CAST[who];
  const [err, setErr] = useState(false);
  return (
    <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bevel-out border border-bevel-dark/50 overflow-hidden bg-parchment-dark">
      {err ? (
        <div
          className="w-full h-full grid place-items-center"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <span className="font-pixel text-[20px]">{c.name[0]}</span>
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

export function IntroModal() {
  const open = useSim((s) => s.introOpen);
  const setIntro = useSim((s) => s.setIntro);
  const [step, setStep] = useState(0);

  // Auto-open on first visit.
  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setIntro(true);
    } catch {
      /* ignore */
    }
  }, [setIntro]);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setIntro(false);
    setStep(0);
  };

  if (!open) return null;

  const s = STEPS[step];
  const c = CAST[s.who];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal
      title="¿Cómo funciona?"
      onClose={close}
      maxWidth="max-w-lg"
      right={
        <span className="font-chrome text-[9px] normal-case opacity-80">
          {step + 1}/{STEPS.length}
        </span>
      }
    >
      <div className="flex gap-3 items-start">
        <Portrait who={s.who} />
        <div className="min-w-0 flex-1">
          <div className="font-chrome uppercase text-[9px] text-ink-soft">
            {c.name} · {c.role}
          </div>
          <h3 className="font-chrome uppercase text-[13px] text-ink mt-0.5 leading-snug">
            {s.title}
          </h3>
          <p className="text-[12px] text-ink-soft leading-relaxed mt-2">{s.text}</p>
        </div>
      </div>

      {/* progress dots */}
      <div className="flex justify-center gap-1.5 mt-3">
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

      {/* nav */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <button type="button" onClick={close} className="btn-retro text-[10px]">
          Saltar
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="btn-retro text-[10px] disabled:opacity-40"
          >
            ◂ Anterior
          </button>
          {isLast ? (
            <button type="button" onClick={close} className="btn-retro text-[10px] bg-amber/30">
              ¡Empezar! ▸
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
              className="btn-retro text-[10px]"
            >
              Siguiente ▸
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
