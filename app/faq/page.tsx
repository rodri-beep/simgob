import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Preguntas frecuentes sobre SimGob: qué es, si es oficial, de dónde salen los datos, qué impuestos puedes simular y cómo se calculan las cifras.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Preguntas frecuentes — SimGob",
    description:
      "Qué es SimGob, si es oficial, de dónde salen los datos y cómo se calculan las cifras.",
    url: absoluteUrl("/faq"),
    type: "website",
  },
};

/** Single source of truth: the visible Q&A and the FAQPage schema use the same text. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué es SimGob?",
    a: "SimGob es un simulador divulgativo y no oficial del gasto, los ingresos y los impuestos del conjunto de las Administraciones Públicas de España (Estado, comunidades autónomas, entidades locales y Seguridad Social). Puedes mover los tipos del IRPF y del Impuesto sobre Sociedades, repartir el gasto por funciones y ver al instante el efecto sobre la recaudación, el saldo y quién gana o pierde por tramo de renta.",
  },
  {
    q: "¿SimGob es oficial?",
    a: "No. Es un proyecto independiente y divulgativo, sin relación con la AEAT ni con el Gobierno de España. Todas las cifras simuladas son estimaciones ilustrativas.",
  },
  {
    q: "¿De dónde salen los datos?",
    a: "Del conjunto de las Administraciones Públicas para el año 2023. El gasto por función procede de Eurostat (clasificación COFOG) y los ingresos de Eurostat, con anclas de recaudación real de la AEAT y magnitudes del INE y la Seguridad Social. El detalle completo está en la página de metodología.",
  },
  {
    q: "¿Qué puedo simular en SimGob?",
    a: "El IRPF (la escala por tramos, de forma uniforme o tramo a tramo, y la base del ahorro), el Impuesto sobre Sociedades (tipo general y tipo mínimo) y el gasto público por función: sanidad, educación, pensiones, defensa, orden público, etc.",
  },
  {
    q: "¿Qué es el IRPF por tramos?",
    a: "El IRPF es un impuesto progresivo: la renta se divide en tramos y cada tramo paga un tipo marginal distinto. En SimGob puedes mover esos tipos —todos a la vez o uno a uno— y ver cómo cambia la recaudación y cuánto paga de más o de menos cada tramo de renta.",
  },
  {
    q: "¿Qué perímetro usa? ¿Por qué Sanidad y Educación salen tan grandes?",
    a: "El perímetro es el conjunto de las Administraciones Públicas (sector S.13: Estado, CCAA, entidades locales y Seguridad Social, consolidados). Por eso Sanidad y Educación aparecen a su tamaño real, incluyendo lo que ejecutan las comunidades autónomas (más del 90 % en ambos casos), y no solo la parte del Estado central.",
  },
  {
    q: "¿Cómo se calculan las cifras?",
    a: "SimGob parte de las cifras oficiales y simula solo la variación: el escenario base reproduce la recaudación y el déficit reales de 2023 y, al mover una palanca, recalcula el cambio sobre la distribución por tramos, no la cifra absoluta desde cero. Es una estimación estática. Hay más detalle en la metodología.",
  },
  {
    q: "¿Las cifras son exactas?",
    a: "No pretenden serlo: son estimaciones ilustrativas con datos agregados por tramo (no microdatos individuales) y sin modelar respuestas de comportamiento como elasticidades, economía sumergida o deslocalización. Sirven para entender órdenes de magnitud y compromisos, no para liquidar impuestos.",
  },
  {
    q: "¿Es gratis? ¿Hace falta registrarse?",
    a: "SimGob es gratuito y no requiere registro ni instalación: funciona en el navegador.",
  },
  {
    q: "¿Puedo compartir mi escenario?",
    a: "Sí. Cada escenario se guarda en la dirección (URL), así que puedes compartir un enlace que reproduce tus cambios, y generar una imagen-resumen con tu perfil político y tu saldo para compartirla en redes.",
  },
  {
    q: "¿Funciona en el móvil?",
    a: "Sí. SimGob tiene una versión adaptada al móvil con el saldo siempre visible y las áreas de gasto e ingresos organizadas por pestañas, además de la versión de escritorio con la ciudad isométrica del gasto.",
  },
];

export default function Faq() {
  return (
    <main className="max-w-[900px] mx-auto p-2 sm:p-4 flex flex-col gap-3">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "SimGob", path: "/" },
          { name: "Preguntas frecuentes", path: "/faq" },
        ])}
      />

      <header className="panel">
        <div className="bg-teal-dark text-parchment px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-pixel text-parchment text-[13px] pixel-title">
            PREGUNTAS FRECUENTES
          </h1>
          <Link href="/" className="btn-retro text-[9px] py-1 no-underline">
            ← Volver al simulador
          </Link>
        </div>
      </header>

      <Panel title="Sobre SimGob">
        <p className="text-[12px] text-ink-soft leading-relaxed mb-3">
          Preguntas frecuentes sobre qué es SimGob, de dónde salen sus datos y cómo se calculan las
          cifras. ¿Quieres el detalle del método?{" "}
          <Link href="/metodologia" className="underline text-ink">
            Lee la metodología
          </Link>
          .
        </p>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <section key={item.q}>
              <h2 className="font-chrome uppercase text-[11px] text-ink leading-snug">{item.q}</h2>
              <p className="text-[12px] text-ink-soft leading-relaxed mt-1">{item.a}</p>
            </section>
          ))}
        </div>
      </Panel>

      <div className="text-center py-2">
        <Link href="/" className="btn-retro text-[10px] no-underline">
          ← Volver al simulador
        </Link>
      </div>
    </main>
  );
}
