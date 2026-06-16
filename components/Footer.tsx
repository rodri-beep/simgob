import Link from "next/link";
import { meta } from "@/lib/data";
import { REPO_URL } from "@/lib/seo";

export function Footer() {
  return (
    <footer className="panel">
      <div className="bg-olive-dark text-parchment titlebar px-2 py-1 text-[9px]">
        Aviso · proyecto no oficial
      </div>
      <div className="p-3 text-[10px] text-ink-soft leading-snug space-y-2">
        <p>
          <b>SimGob</b> es un simulador divulgativo y <b>no oficial</b>. Sin
          relación con la AEAT ni con el Gobierno de España. Todas las cifras simuladas
          son <b>estimaciones ilustrativas</b> con datos agregados (no individuales) y
          sin respuesta de comportamiento. Año base {meta.baseYear}.
        </p>
        <p>
          Perímetro: conjunto de las Administraciones Públicas (Estado, CCAA, entidades
          locales y Seguridad Social). Datos de fuentes públicas:{" "}
          <a
            className="underline"
            href="https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Eurostat
          </a>
          , AEAT, INE y Seguridad Social. Detalle y limitaciones en la{" "}
          <Link href="/metodologia" className="underline">
            metodología
          </Link>
          .
        </p>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          <Link href="/metodologia" className="underline font-chrome uppercase text-[8px] tracking-wide">
            Metodología
          </Link>
          <Link href="/faq" className="underline font-chrome uppercase text-[8px] tracking-wide">
            Preguntas frecuentes
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-chrome uppercase text-[8px] tracking-wide"
          >
            Código en GitHub
          </a>
        </nav>
        <p className="font-chrome uppercase text-[8px] tracking-wide text-ink-soft/80">
          SimGob · un proyecto de Desvent
        </p>
      </div>
    </footer>
  );
}
