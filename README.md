# Presupuestópolis

Simulador **divulgativo y no oficial** de los Presupuestos Generales del Estado
(PGE) y de los impuestos en España, con estética retro de _management-sim_ de los
90 (estilo SimCity 2000 / Theme Hospital). Mueve los tipos del **IRPF** y del
**Impuesto sobre Sociedades** y observa el efecto sobre la recaudación, el saldo y
quién gana o pierde por tramo de renta.

> ⚠️ Proyecto **no oficial**, sin relación con la AEAT ni con el Gobierno. Todas
> las cifras simuladas son **estimaciones ilustrativas** (datos agregados, sin
> respuesta de comportamiento). Año base **2023**.

## Stack

- **Next.js 14** (App Router) + **TypeScript**, página única, 100 % estático →
  desplegable en **Vercel** sin backend.
- **Tailwind CSS** con tema retro propio (chrome biselado, paleta limitada,
  dithering, fuentes de píxel solo en el _chrome_).
- **Zustand** para el estado del escenario.
- Cálculo en **funciones puras** del cliente, con tests (**Vitest**).
- Tablero **isométrico en SVG** con geometría 100 % original.

## Cómo ejecutar

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm run test       # tests del motor de cálculo
npm run typecheck  # comprobación de tipos
npm run ingest     # valida los datos contra las fuentes (ver data/README.md)
```

## Estructura

```
app/                 Página única + /metodologia + estilos globales
components/           UI: tablero, panel de control, barra de estado, capa dinámica
lib/engine/          Motor de cálculo puro (IRPF, IS, presupuesto) + tests
lib/iso.ts           Geometría isométrica (proyección 2:1)
lib/data.ts          Carga tipada de los JSON
data/*.json          Datos consumidos por la app (committeados)
data/raw/            Ficheros oficiales descargados (trazabilidad)
scripts/ingest.ts    Script de ingesta/validación (año parametrizable)
public/fonts/        Press Start 2P + Silkscreen (SIL OFL 1.1)
```

## Principio de cálculo (credibilidad)

Partimos de las cifras **oficiales** y simulamos solo el **delta**: el escenario
base reproduce la recaudación real y, al mover un parámetro, recalculamos la
variación sobre la distribución por tramos (no la cifra absoluta desde cero).

- **IRPF**: la escala se aplica sobre la base liquidable media de cada tramo
  (modelando el mínimo personal y familiar). Se calibra para que la base coincida
  con la recaudación oficial y se aplica la misma calibración al escenario. El
  IRPF se reparte ~50 % Estado / 50 % CCAA: al saldo del Estado llega la mitad.
- **IS**: anclado a la recaudación real; el tipo general escala proporcionalmente.
  Se muestra el tipo efectivo (≈ 22 %) frente al nominal (25 %).

Detalle completo y limitaciones en `/metodologia` y en
[`data/README.md`](./data/README.md).

## Perímetro

Perímetro PGE (criterio Civio): Estado + organismos autónomos + agencias +
Seguridad Social + entidades con presupuesto limitativo. **No** incluye el gasto
de CCAA ni entidades locales (por eso Sanidad y Educación salen "pequeñas" y
Pensiones grande).

## Roadmap

- **v1 (este)**: IRPF + IS editables; resto de ingresos y todo el gasto en solo
  lectura; tablero como navegación; capa dinámica de tablas y gráficos.
- **P1**: edición de partidas de gasto, compartir escenario por URL, sonido y CRT,
  versión en inglés.
- **P2**: IVA por categorías, comparativa internacional (OCDE/Eurostat), desglose
  por CCAA, galería de escenarios.

## Créditos y licencias

- Estructura de datos de ingresos/gasto basada en el proyecto de código abierto
  de **Civio** ([civio/presupuesto](https://github.com/civio/presupuesto)).
- Fuentes oficiales: AEAT, Ministerio de Hacienda, INE.
- Fuentes tipográficas Press Start 2P y Silkscreen bajo SIL OFL 1.1
  (ver `public/fonts/LICENSE.md`).
- Activos visuales 100 % originales; ninguna marca, sprite o nombre de juegos
  comerciales.
