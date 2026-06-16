import type { Metadata } from "next";
import { spendingPolicies, buildings, meta } from "@/lib/data";
import { formatM, formatPctValue } from "@/lib/engine/format";
import { Panel } from "@/components/ui/Panel";
import { GuideLayout, GuideP } from "@/components/guides/GuideLayout";
import { guideBySlug } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

const guide = guideBySlug("en-que-se-gasta-el-dinero-publico")!;

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
  const byFunction = buildings
    .map((b) => {
      const amount = spendingPolicies
        .filter((p) => p.building === b.id)
        .reduce((a, p) => a + p.amount, 0);
      return { label: b.label, amount, who: b.delegated?.who ?? "Estado central" };
    })
    .sort((a, b) => b.amount - a.amount);
  const total = byFunction.reduce((a, x) => a + x.amount, 0);
  const top = byFunction[0];

  return (
    <GuideLayout guide={guide}>
      <Panel title="El gasto público de 2023, por función">
        <div className="space-y-2">
          <GuideP>
            En 2023, el conjunto de las <b>Administraciones Públicas</b> de España —Estado,
            comunidades autónomas, entidades locales y Seguridad Social— gastó{" "}
            <b className="tnum">{formatM(total)}</b>, frente a{" "}
            <b className="tnum">{formatM(meta.totalRevenueOfficial)}</b> de ingresos: un{" "}
            <b>déficit</b> de <b className="tnum">{formatM(meta.officialDeficitAapp)}</b> (≈{" "}
            {formatPctValue(meta.officialDeficitAappPct, 1)} del PIB).
          </GuideP>
          <GuideP>
            El gasto se clasifica por <b>función (COFOG, Eurostat)</b>. A diferencia de mirar solo
            los Presupuestos Generales del Estado, aquí Sanidad y Educación salen a su tamaño real,
            porque incluyen lo que ejecutan las comunidades autónomas (más del 90 % en ambos casos).
          </GuideP>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[11px] tnum border-collapse">
            <thead>
              <tr className="font-chrome uppercase text-[8px] text-ink-soft text-right">
                <th className="text-left font-normal py-1">Función</th>
                <th className="font-normal">Gasto 2023</th>
                <th className="font-normal">% del total</th>
                <th className="text-left font-normal pl-3">Ejecuta sobre todo</th>
              </tr>
            </thead>
            <tbody>
              {byFunction.map((f) => (
                <tr key={f.label} className="text-right border-t border-bevel-dark/20">
                  <td className="text-left py-0.5 font-data">{f.label}</td>
                  <td>{formatM(f.amount)}</td>
                  <td>{formatPctValue((f.amount / total) * 100, 1)}</td>
                  <td className="text-left pl-3 text-ink-soft">{f.who}</td>
                </tr>
              ))}
              <tr className="text-right border-t-2 border-bevel-dark/50 font-bold">
                <td className="text-left py-0.5 font-chrome uppercase text-[9px]">Total</td>
                <td>{formatM(total)}</td>
                <td>100 %</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Qué cuenta esta foto">
        <div className="space-y-2">
          <GuideP>
            La mayor partida es, con diferencia, <b>{top.label.toLowerCase()}</b> (
            {formatM(top.amount)}, {formatPctValue((top.amount / total) * 100, 0)} del gasto), que
            agrupa pensiones, desempleo y el resto de prestaciones y servicios sociales y la paga
            sobre todo la Seguridad Social. Le siguen la sanidad y los servicios públicos generales
            (que incluyen los intereses de la deuda).
          </GuideP>
          <GuideP>
            Son cifras del perímetro de las Administraciones Públicas (sector S.13 de la contabilidad
            nacional), con datos de Eurostat. ¿Quieres ver el detalle del método y las fuentes? Está
            todo en la <a className="underline text-ink" href="/metodologia">metodología</a>.
          </GuideP>
          <GuideP>
            <b>Recórtalo o amplíalo tú.</b> En el simulador puedes mover cada función y ver al
            instante cómo cambia el saldo, además del IRPF y el Impuesto sobre Sociedades.
          </GuideP>
        </div>
      </Panel>
    </GuideLayout>
  );
}
