import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { GUIDES, type GuideMeta } from "@/lib/guides";

/** Shared chrome for a guide page: retro header, schema, and cross-links. */
export function GuideLayout({ guide, children }: { guide: GuideMeta; children: ReactNode }) {
  const others = GUIDES.filter((g) => g.slug !== guide.slug);
  return (
    <main className="max-w-[900px] mx-auto p-2 sm:p-4 flex flex-col gap-3">
      <JsonLd data={articleJsonLd(guide)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "SimGob", path: "/" },
          { name: "Guías", path: "/guias" },
          { name: guide.h1, path: `/guias/${guide.slug}` },
        ])}
      />

      <header className="panel">
        <div className="bg-teal-dark text-parchment px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="font-pixel text-amber text-[8px] tracking-wide mb-1">GUÍA · SIMGOB</div>
            <h1 className="font-chrome uppercase text-parchment text-[13px] leading-snug">
              {guide.h1}
            </h1>
          </div>
          <Link href="/" className="btn-retro text-[9px] py-1 no-underline shrink-0">
            ▶ Abrir el simulador
          </Link>
        </div>
      </header>

      {children}

      <section className="panel">
        <div className="bg-olive-dark text-parchment titlebar px-2 py-1 text-[10px]">
          Sigue explorando
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {others.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="text-[12px] underline text-ink">
              {g.h1}
            </Link>
          ))}
          <Link href="/metodologia" className="text-[12px] underline text-ink">
            Metodología y fuentes
          </Link>
          <Link href="/faq" className="text-[12px] underline text-ink">
            Preguntas frecuentes
          </Link>
        </div>
      </section>

      <div className="text-center py-2">
        <Link href="/" className="btn-retro text-[10px] no-underline">
          ▶ Abrir el simulador
        </Link>
      </div>
    </main>
  );
}

/** Small helpers reused across guide bodies. */
export function GuideP({ children }: { children: ReactNode }) {
  return <p className="text-[12px] text-ink-soft leading-relaxed">{children}</p>;
}
