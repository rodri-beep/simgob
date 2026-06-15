import type { Metadata } from "next";
import Link from "next/link";
import { meta } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = {
  title: "Metodología y fuentes — Presupuestópolis",
  description:
    "Cómo se calculan las cifras de Presupuestópolis: fuentes oficiales, perímetro, principio de cálculo y limitaciones.",
};

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-ink-soft leading-relaxed">{children}</p>;
}

export default function Metodologia() {
  return (
    <main className="max-w-[900px] mx-auto p-2 sm:p-4 flex flex-col gap-3">
      <header className="panel">
        <div className="bg-teal-dark text-parchment px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-pixel text-parchment text-[13px] pixel-title">
            METODOLOGÍA
          </h1>
          <Link href="/" className="btn-retro text-[9px] py-1 no-underline">
            ← Volver al simulador
          </Link>
        </div>
      </header>

      <Panel title="Qué es (y qué no es)">
        <div className="space-y-2">
          <P>
            <b>Presupuestópolis</b> es un simulador <b>divulgativo y no oficial</b> de los
            Presupuestos Generales del Estado (PGE) y de dos impuestos. Permite mover los
            tipos del <b>IRPF</b> y del <b>Impuesto sobre Sociedades (IS)</b> y ver el
            efecto sobre la recaudación, el saldo y quién gana o pierde por tramo de renta.
            No tiene relación con la AEAT ni con el Gobierno.
          </P>
          <P>
            No es un microsimulador oficial: no usa microdatos individuales (EUROMOD / IEF-AEAT)
            y no modela respuestas de comportamiento (elasticidades, economía sumergida,
            deslocalización). Es una <b>estimación estática</b> con datos agregados por tramo.
            Todas las cifras simuladas se etiquetan como <b>estimación ilustrativa</b>.
          </P>
        </div>
      </Panel>

      <Panel title="Perímetro (qué entra y qué no)">
        <P>{meta.perimeter}</P>
        <div className="mt-2">
          <P>
            Consecuencia a tener en cuenta: <b>Sanidad</b> y <b>Educación</b> aparecen
            &ldquo;pequeñas&rdquo; porque aquí solo se ve la parte estatal; el grueso lo
            ejecutan las Comunidades Autónomas (fuera del perímetro). <b>Pensiones</b> sale
            grande porque la Seguridad Social sí está dentro.
          </P>
        </div>
      </Panel>

      <Panel title="Principio de cálculo: partir de lo real y simular solo el delta">
        <div className="space-y-2">
          <P>
            El escenario base reproduce las cifras oficiales. Cuando mueves un parámetro,
            recalculamos la <b>variación</b> sobre la distribución por tramos, no la cifra
            absoluta desde cero. Así la base siempre coincide con la realidad y solo se
            modela el cambio.
          </P>
          <P>
            <b>IRPF.</b> Aplicamos la escala (tramos y tipos) sobre la base liquidable media
            de cada tramo de la <i>Estadística de declarantes 2023</i>, modelando el mínimo
            personal y familiar (5.550 €). Calibramos el modelo para que la base reproduzca
            la recaudación oficial ({"k = recaudación / cuota modelada"}) y aplicamos la
            misma calibración al escenario. Comparamos base y escenario para obtener la
            Δrecaudación y los ganadores/perdedores por tramo. La base general y la del
            ahorro se tratan por separado. El IRPF se reparte ~50 % Estado / 50 % CCAA: en
            el saldo del Estado se refleja la mitad del cambio nacional.
          </P>
          <P>
            <b>IS.</b> Anclamos a la recaudación real del Informe Anual (35.060 M€), no a la
            cuota nominal. El tipo general escala la recaudación de forma proporcional. El
            <b> tipo efectivo</b> sobre la base imponible (≈ 21,9 %) es menor que el nominal
            (25 %) por deducciones, bonificaciones y la consolidación de grupos (modelo 220).
            La palanca del tipo mínimo es una aproximación gruesa: con datos agregados solo
            añade recaudación si supera el tipo efectivo medio.
          </P>
        </div>
      </Panel>

      <Panel title="Año base y actualización">
        <P>
          Todo el escenario base está anclado al ejercicio fiscal <b>{meta.baseYear}</b>,
          coherente entre gasto (PGE), IRPF (estadística de declarantes), IS (cuentas
          anuales) y recaudación real (Informe Anual). El año está parametrizado para
          facilitar futuras actualizaciones cuando se publiquen nuevos presupuestos o
          estadísticas.
        </P>
      </Panel>

      <Panel title="Limitaciones declaradas">
        <ul className="text-[12px] text-ink-soft leading-relaxed list-disc pl-5 space-y-1">
          <li>Datos agrupados por tramo (no individuales): mayor error en el tramo superior (cola larga).</li>
          <li>Sin respuesta de comportamiento (elasticidades, deslocalización, economía sumergida).</li>
          <li>El IS no consolidado no refleja la cuota real de los grupos; se ancla a la recaudación.</li>
          <li>Ingresos (recaudación / presupuesto) y gastos (presupuesto inicial) usan criterios distintos: el saldo es una aproximación. El déficit real de las AAPP en 2023 fue de {new Intl.NumberFormat("es-ES").format(meta.officialDeficitAapp)} M€ (≈ {meta.officialDeficitAappPct} % del PIB).</li>
          <li>En v1 solo el IRPF y el IS son editables; el resto de ingresos y todo el gasto son de solo lectura.</li>
        </ul>
      </Panel>

      <Panel title="Fuentes">
        <ul className="space-y-2">
          {meta.sources.map((s) => (
            <li key={s.id} className="text-[12px]">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-ink font-data"
              >
                {s.label}
              </a>
              {s.note && <span className="text-ink-soft"> — {s.note}</span>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Propiedad intelectual y créditos">
        <div className="space-y-2">
          <P>
            Estética inspirada en los simuladores de gestión isométricos de los 90, con
            <b> activos 100 % originales</b> (geometría SVG propia; nada de sprites, fuentes
            o nombres de aquellos juegos). Tipografías de píxel <i>Press Start 2P</i> y
            <i> Silkscreen</i> bajo licencia SIL Open Font License.
          </P>
          <P>
            Estructura de datos de gasto e ingresos basada en el proyecto de código abierto
            de <b>Civio</b> (¿Dónde van mis impuestos? / civio/presupuesto), con atribución.
          </P>
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
