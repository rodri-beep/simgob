/**
 * Central SEO configuration + JSON-LD (schema.org) builders.
 *
 * The canonical site URL is env-driven so forks/staging can override it without
 * touching code: set NEXT_PUBLIC_SITE_URL. Defaults to the production domain.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://simgob.com"
).replace(/\/+$/, "");

export const SITE_NAME = "SimGob";
export const SITE_TITLE = "SimGob — Gobierna. Decide. Cuadra las cuentas.";
export const SITE_DESCRIPTION =
  "Simulador divulgativo y no oficial del gasto, los ingresos y los impuestos de las Administraciones Públicas en España. Mueve el IRPF por tramos y el Impuesto sobre Sociedades, reparte el gasto por funciones y observa el efecto sobre la recaudación, el saldo y quién gana o pierde por tramo de renta. Estimación ilustrativa, año base 2023.";

export const SITE_KEYWORDS = [
  "simulador presupuesto España",
  "presupuestos generales del estado",
  "IRPF por tramos",
  "simulador IRPF",
  "impuesto sobre sociedades",
  "gasto público España",
  "en qué se gasta el dinero público",
  "déficit público España",
  "Administraciones Públicas",
  "política fiscal España",
  "COFOG",
  "SimGob",
];

export const ORG_NAME = "Desvent";

/** Absolute URL for a path (e.g. "/faq" -> "https://simgob.com/faq"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const ORG_ID = `${SITE_URL}/#organization`;

function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: SITE_URL,
  };
}

function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "es-ES",
    publisher: { "@id": ORG_ID },
  };
}

function webApplicationLd() {
  return {
    "@type": ["WebApplication", "SoftwareApplication"],
    "@id": `${SITE_URL}/#webapp`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "es-ES",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** Site-wide structured data graph (Organization + WebSite + WebApplication). */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationLd(), websiteLd(), webApplicationLd()],
  };
}

/** FAQPage structured data. Items must match the visible Q&A on the page. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** BreadcrumbList structured data. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
