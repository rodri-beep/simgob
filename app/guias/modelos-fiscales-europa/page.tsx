import type { Metadata } from "next";
import { aappBaseline, countryModels } from "@/lib/data";
import { formatPct } from "@/lib/engine/format";
import { Panel } from "@/components/ui/Panel";
import { GuideLayout, GuideP } from "@/components/guides/GuideLayout";
import { guideBySlug } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

const guide = guideBySlug("modelos-fiscales-europa")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: `/guias/${guide.slug}` },
  openGraph: {
    title: `${guide.h1} — SimGob`,
    description: guide.description,
    url: absoluteUrl(`/guias/${guide.slug}`),
    type: "article",
  },
};

export default function Page() {
  const exp = aappBaseline.totalExpenditure;
  const spain = {
    label: "🇪🇸 España",
    rev: aappBaseline.totalRevenue / aappBaseline.gdp,
    social: aappBaseline.cofog.social / exp,
    salud: aappBaseline.cofog.salud / exp,
    educacion: aappBaseline.cofog.educacion / exp,
    highlight: true,
  };
  const rows = [
    spain,
    ...countryModels.map((c) => ({
      label: `${c.flag ? c.flag + " " : ""}${c.label}`,
      rev: c.revenuePctGdp,
      social: c.cofogShares.social,
      salud: c.cofogShares.salud,
      educacion: c.cofogShares.educacion,
      highlight: false,
    })),
  ];

  return (
    <GuideLayout guide={guide}>
      <Panel title="Dos formas de comparar países">
        <div className="space-y-2">
          <GuideP>
            Comparar el sector público de dos países se reduce, a grandes rasgos, a dos preguntas:{" "}
            <b>cuánto recauda</b> (su presión fiscal, medida como ingresos sobre el PIB) y{" "}
            <b>en qué lo gasta</b> (cómo reparte el gasto por función). España recauda en torno al{" "}
            <b className="tnum">{formatPct(spain.rev, 1)}</b> del PIB; la mayoría de los grandes
            países de la UE están bastante por encima, y Estados Unidos, claramente por debajo.
          </GuideP>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[11px] tnum border-collapse">
            <thead>
              <tr className="font-chrome uppercase text-[8px] text-ink-soft text-right">
                <th className="text-left font-normal py-1">País</th>
                <th className="font-normal">Ingresos / PIB</th>
                <th className="font-normal">Social</th>
                <th className="font-normal">Sanidad</th>
                <th className="font-normal">Educación</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className={`text-right border-t border-bevel-dark/20 ${
                    r.highlight ? "bg-amber/15 font-bold" : ""
                  }`}
                >
                  <td className="text-left py-0.5 font-data">{r.label}</td>
                  <td>{formatPct(r.rev, 1)}</td>
                  <td>{formatPct(r.social, 0)}</td>
                  <td>{formatPct(r.salud, 0)}</td>
                  <td>{formatPct(r.educacion, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[8px] text-ink-soft/80 mt-1">
            Ingresos sobre PIB (presión fiscal, OCDE) y reparto del gasto por función (COFOG,
            Eurostat). Porcentajes de gasto sobre el gasto público total de cada país.
          </p>
        </div>
      </Panel>

      <Panel title="Qué se ve en la tabla">
        <div className="space-y-2">
          <GuideP>
            Las economías nórdicas y Francia recaudan en torno a la mitad del PIB y dedican una
            porción mayor a educación que España; Estados Unidos recauda mucho menos y concentra una
            parte muy alta de su gasto en sanidad. La protección social pesa de forma parecida en
            casi todos (es la mayor función en toda Europa), pero el nivel total de ingresos es lo
            que más cambia la foto.
          </GuideP>
          <GuideP>
            Ojo: adoptar el nivel de ingresos de Suecia o el reparto de Alemania no significa tener
            sus servicios ni su economía. Es una forma de <b>entender estructuras</b>, no una
            receta. Son estimaciones ilustrativas; el detalle está en la{" "}
            <a className="underline text-ink" href="/metodologia">metodología</a>.
          </GuideP>
          <GuideP>
            <b>Pruébalo.</b> En la pestaña <b>Modelos</b> del simulador puedes adoptar la estructura
            de gasto y el nivel de impuestos de otro país sobre el presupuesto español y ver cómo se
            reorganiza la tarta y en qué te convierte.
          </GuideP>
        </div>
      </Panel>
    </GuideLayout>
  );
}
