import type { Metadata } from "next";
import Link from "next/link";
import { meta, human } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = {
  title: "Metodología y fuentes — SimGob",
  description:
    "Cómo se calculan las cifras de SimGob: fuentes oficiales, perímetro, principio de cálculo y limitaciones.",
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
            <b>SimGob</b> es un simulador <b>divulgativo y no oficial</b> del gasto y los
            ingresos del conjunto de las <b>Administraciones Públicas</b> y de dos impuestos.
            Permite mover los tipos del <b>IRPF</b> y del <b>Impuesto sobre Sociedades (IS)</b>
            y ajustar las <b>funciones de gasto</b>, y ver el efecto sobre la recaudación, el
            saldo y quién gana o pierde por tramo de renta. No tiene relación con la AEAT ni con
            el Gobierno.
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
        <div className="mt-2 space-y-2">
          <P>
            A diferencia de mirar solo los Presupuestos Generales del Estado, aquí
            <b> Sanidad</b> (≈ 98.600 M€) y <b>Educación</b> (≈ 62.500 M€) aparecen a su
            tamaño real, porque incluimos lo que ejecutan las Comunidades Autónomas (más del
            90 % en ambos casos). En cada función verás una línea de &ldquo;de lo cual lo
            ejecutan las CCAA / la Seguridad Social&rdquo;, para que se entienda quién gestiona
            cada euro aunque cuente en el total.
          </P>
          <P>
            El gasto se clasifica por <b>función (COFOG, Eurostat)</b> en 10 grandes áreas. La
            suma de funciones según Eurostat es 680.225 M€; el total de gasto de las AAPP
            (680.952 M€) lleva un pequeño ajuste de conciliación (≈ 0,7 mil M€, dentro de la
            diferencia habitual entre las dos series de Eurostat) imputado a Servicios
            generales, para que el saldo cuadre con el déficit oficial.
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
            ahorro se tratan por separado. Como el perímetro son las Administraciones
            Públicas (Estado + CCAA), el IRPF cuenta íntegro: el cambio nacional se traslada
            por completo al saldo.
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
          coherente entre gasto (Eurostat COFOG), ingresos (Eurostat), IRPF (estadística de
          declarantes), IS (cuentas anuales) y recaudación real (Informe Anual). El año está
          parametrizado para facilitar futuras actualizaciones cuando se publiquen nuevos
          datos.
        </P>
      </Panel>

      <Panel title="Historias: de los € a las personas">
        <div className="space-y-2">
          <P>
            Para que las cifras se entiendan, cada número se acompaña de una traducción humana
            que reacciona al mover las palancas. Son <b>estimaciones ilustrativas</b>.
          </P>
          <P>
            <b>Salario bruto → neto (&ldquo;¿y a ti?&rdquo; y renta por tramo).</b> Modelo
            simplificado para un contribuyente soltero con solo rendimientos del trabajo, 12 pagas:
            cotización del trabajador 6,45 % (hasta la base máxima de 53.946 €/año), &ldquo;otros
            gastos&rdquo; 2.000 €, reducción por rendimientos del trabajo (6.498 €, factor 1,14) y
            la escala combinada del IRPF menos el mínimo personal (5.550 €). Reacciona al escenario.
          </P>
          <P>
            <b>Gasto por persona.</b> Donde hay un colectivo claro usamos anclas por beneficiario:
            Pensiones (10,1 M de pensiones, media 1.199 €/mes en 14 pagas) y Desempleo (1,77 M de
            perceptores, prestación media 959 €/mes); al recortar o ampliar la partida, la media se
            ajusta <b>de forma lineal</b>. Para el resto usamos anclas universales: € por habitante
            (48,1 M), por hogar (19,1 M) y M€ por día.
          </P>
          <P>
            <b>Mediana y tramo más numeroso del IRPF</b> se calculan a partir de la estadística de
            declarantes: la mediana es el tramo donde cae el declarante del percentil 50, y el
            &ldquo;tramo más numeroso&rdquo;, el de mayor número de declarantes.
          </P>
        </div>
      </Panel>

      <Panel title="Limitaciones declaradas">
        <ul className="text-[12px] text-ink-soft leading-relaxed list-disc pl-5 space-y-1">
          <li>Datos agrupados por tramo (no individuales): mayor error en el tramo superior (cola larga).</li>
          <li>Sin respuesta de comportamiento (elasticidades, deslocalización, economía sumergida).</li>
          <li>El IS no consolidado no refleja la cuota real de los grupos; se ancla a la recaudación.</li>
          <li>El saldo base reproduce el déficit oficial de las AAPP en 2023: {new Intl.NumberFormat("es-ES").format(meta.officialDeficitAapp)} M€ (≈ {meta.officialDeficitAappPct} % del PIB). Ingresos y gastos proceden de series de Eurostat con criterios homogéneos (contabilidad nacional).</li>
          <li>Dentro de Protección social, separamos Pensiones y Desempleo (con datos de la Seguridad Social y el SEPE) y agrupamos el resto en &ldquo;otras prestaciones y servicios sociales&rdquo;.</li>
          <li>Son editables el IRPF, el IS y las funciones de gasto; el resto de ingresos es de solo lectura. El gasto solo afecta al saldo (sin efectos de segundo orden: recortar una partida no cambia la recaudación).</li>
        </ul>
      </Panel>

      <Panel title="Fuentes">
        <ul className="space-y-2">
          {[...meta.sources, ...human.sources].map((s) => (
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
            Datos de gasto e ingresos de <b>Eurostat</b> (cuentas de las Administraciones
            Públicas y clasificación funcional COFOG), con anclas de recaudación, distribución
            por tramos y magnitudes humanas de la <b>AEAT</b>, el <b>INE</b> y la
            <b> Seguridad Social</b>.
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
