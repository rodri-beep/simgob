/** Metadata for the divulgative "guías" (the SEO source/explainer pages). */
export interface GuideMeta {
  slug: string;
  /** <h1> and link text. */
  h1: string;
  /** <title> (the "— SimGob" suffix is added by the metadata template). */
  title: string;
  /** Meta description. */
  description: string;
  /** One-line summary used on cards / the index. */
  blurb: string;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: "en-que-se-gasta-el-dinero-publico",
    h1: "¿En qué se gasta el dinero público en España?",
    title: "¿En qué se gasta el dinero público en España?",
    description:
      "El gasto de las Administraciones Públicas españolas en 2023 por función: protección social, sanidad, educación, pensiones, defensa… con cifras y quién ejecuta cada euro.",
    blurb:
      "El reparto del gasto público de 2023 por función, con cifras reales y quién ejecuta cada euro: Estado, comunidades autónomas o Seguridad Social.",
  },
  {
    slug: "irpf-por-tramos",
    h1: "El IRPF por tramos, explicado",
    title: "El IRPF por tramos, explicado (escala 2023)",
    description:
      "Qué es el IRPF, cómo funcionan los tramos y los tipos marginales, la escala estatal de 2023, el mínimo personal y cuánto se recauda. Con simulador interactivo.",
    blurb:
      "Cómo funcionan los tramos y los tipos marginales del IRPF, la escala de 2023 y la diferencia entre tipo marginal y tipo medio.",
  },
  {
    slug: "modelos-fiscales-europa",
    h1: "España frente a Europa: cuánto recaudan y en qué gastan",
    title: "España vs. Europa: presión fiscal y estructura de gasto",
    description:
      "Cuánto recauda España sobre el PIB frente a Suecia, Alemania, Francia, Italia o la media de la UE, y cómo cambia la estructura de gasto por función.",
    blurb:
      "Presión fiscal (ingresos sobre PIB) y estructura de gasto de España frente a Suecia, Alemania, Francia, Italia y la media de la UE.",
  },
];

export function guideBySlug(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
