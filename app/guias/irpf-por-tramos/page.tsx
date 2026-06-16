import type { Metadata } from "next";
import { irpfData } from "@/lib/data";
import { medianBracket, modalBracket } from "@/lib/engine/stories";
import { formatM, formatPct, formatCount } from "@/lib/engine/format";
import { Panel } from "@/components/ui/Panel";
import { GuideLayout, GuideP } from "@/components/guides/GuideLayout";
import { guideBySlug } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

const guide = guideBySlug("irpf-por-tramos")!;

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

function bracketLabel(thresholds: number[], i: number): string {
  const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);
  const lo = thresholds[i];
  const hi = thresholds[i + 1];
  if (i === 0) return `Hasta ${fmt(hi)} €`;
  if (hi === undefined) return `Más de ${fmt(lo)} €`;
  return `${fmt(lo)} – ${fmt(hi)} €`;
}

function ScaleTable({ scale }: { scale: { threshold: number; rate: number }[] }) {
  const thresholds = scale.map((b) => b.threshold);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] tnum border-collapse">
        <thead>
          <tr className="font-chrome uppercase text-[8px] text-ink-soft text-right">
            <th className="text-left font-normal py-1">Base liquidable</th>
            <th className="font-normal">Tipo marginal</th>
          </tr>
        </thead>
        <tbody>
          {scale.map((b, i) => (
            <tr key={b.threshold} className="text-right border-t border-bevel-dark/20">
              <td className="text-left py-0.5 font-data">{bracketLabel(thresholds, i)}</td>
              <td className="font-bold">{formatPct(b.rate, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const declarantes = irpfData.brackets.reduce((a, b) => a + b.declarantes, 0);
  const median = medianBracket(irpfData.brackets);
  const modal = modalBracket(irpfData.brackets);
  const totalBase = irpfData.brackets.reduce((a, b) => a + b.baseGeneral + b.baseSavings, 0);
  const tipoMedio = irpfData.officialRevenue / totalBase;

  return (
    <GuideLayout guide={guide}>
      <Panel title="Qué es el IRPF por tramos">
        <div className="space-y-2">
          <GuideP>
            El <b>IRPF</b> (Impuesto sobre la Renta de las Personas Físicas) es un impuesto{" "}
            <b>progresivo</b>: la base liquidable se divide en <b>tramos</b> y cada tramo paga un{" "}
            <b>tipo marginal</b> distinto. Importante: el tipo de un tramo solo se aplica a la parte
            de la renta que cae <i>dentro</i> de ese tramo, no a toda la renta.
          </GuideP>
          <GuideP>
            Antes de aplicar la escala se descuenta el <b>mínimo personal y familiar</b> (5.550 € en
            general), una primera porción de la base que, en la práctica, queda exenta. Por eso las
            rentas más bajas pagan ~0 €.
          </GuideP>
        </div>
      </Panel>

      <Panel title="La escala general de 2023 (estatal + autonómica)">
        <ScaleTable scale={irpfData.scale.general} />
        <GuideP>
          <span className="block mt-2">
            La base del <b>ahorro</b> (intereses, dividendos, plusvalías) tributa por una escala
            propia, más plana:
          </span>
        </GuideP>
        <div className="mt-2">
          <ScaleTable scale={irpfData.scale.savings} />
        </div>
      </Panel>

      <Panel title="Quién paga y cuánto se recauda">
        <div className="space-y-2">
          <GuideP>
            En 2023 hubo <b className="tnum">{formatCount(declarantes)}</b> declaraciones. El{" "}
            <b>declarante mediano</b> se sitúa en el tramo <b>{median?.label}</b> y el tramo más
            numeroso es <b>{modal?.label}</b>. El IRPF recaudó{" "}
            <b className="tnum">{formatM(irpfData.officialRevenue)}</b> entre todas las
            administraciones (Estado + comunidades autónomas).
          </GuideP>
          <GuideP>
            <b>Marginal ≠ medio.</b> Alguien en el tramo del 37 % no paga el 37 % de toda su renta:
            solo de la parte que supera ese umbral. De hecho, el <b>tipo medio</b> del conjunto del
            IRPF sobre la base liquidable ronda el <b className="tnum">{formatPct(tipoMedio, 1)}</b>.
          </GuideP>
          <GuideP>
            <b>Pruébalo.</b> En el simulador puedes subir o bajar los tipos —todos a la vez o tramo
            a tramo— y ver al instante cuánto cambia la recaudación y quién gana o pierde por tramo
            de renta, además de calcular tu propio sueldo neto en «¿y a ti?». El método completo está
            en la <a className="underline text-ink" href="/metodologia">metodología</a>.
          </GuideP>
        </div>
      </Panel>
    </GuideLayout>
  );
}
