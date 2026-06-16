import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES } from "@/lib/guides";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guías",
  description:
    "Guías divulgativas sobre el presupuesto y los impuestos en España: en qué se gasta el dinero público, el IRPF por tramos y la comparación con Europa.",
  alternates: { canonical: "/guias" },
};

export default function Guias() {
  return (
    <main className="max-w-[900px] mx-auto p-2 sm:p-4 flex flex-col gap-3">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "SimGob", path: "/" },
          { name: "Guías", path: "/guias" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(GUIDES.map((g) => ({ name: g.h1, path: `/guias/${g.slug}` })))}
      />

      <header className="panel">
        <div className="bg-teal-dark text-parchment px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-pixel text-parchment text-[13px] pixel-title">GUÍAS</h1>
          <Link href="/" className="btn-retro text-[9px] py-1 no-underline">
            ← Volver al simulador
          </Link>
        </div>
      </header>

      <Panel title="Entiende el presupuesto y los impuestos de España">
        <p className="text-[12px] text-ink-soft leading-relaxed mb-3">
          Explicaciones cortas y con cifras reales para entender de dónde sale y a dónde va el dinero
          público —y para sacarle más partido al simulador.
        </p>
        <div className="space-y-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guias/${g.slug}`}
              className="block panel-inset px-3 py-2 no-underline hover:bg-parchment-dark"
            >
              <div className="font-chrome uppercase text-[11px] text-ink leading-snug">{g.h1}</div>
              <p className="text-[11px] text-ink-soft leading-snug mt-1">{g.blurb}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="text-center py-2 flex flex-wrap items-center justify-center gap-2">
        <Link href="/metodologia" className="btn-retro text-[10px] no-underline">
          Metodología
        </Link>
        <Link href="/faq" className="btn-retro text-[10px] no-underline">
          Preguntas frecuentes
        </Link>
      </div>
    </main>
  );
}
