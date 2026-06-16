# SimGob

**▶ Pruébalo en [simgob.com](https://simgob.com)** · [Preguntas frecuentes](https://simgob.com/faq) · [Metodología](https://simgob.com/metodologia)

[![SimGob — simulador del presupuesto y los impuestos de España](https://simgob.com/opengraph-image)](https://simgob.com)

Simulador **divulgativo y no oficial** del gasto y los ingresos de las
**Administraciones Públicas** (Estado, CCAA, entidades locales y Seguridad Social)
y de los impuestos en España, con estética retro de _management-sim_ de los 90.
Mueve los tipos del **IRPF** y del **Impuesto sobre Sociedades**, reparte el gasto
por funciones y observa el efecto sobre la recaudación, el saldo y quién gana o
pierde por tramo de renta.

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
- **PostHog** (nube UE) para analítica de tráfico y uso, solo en producción
  (ver «Analítica» más abajo).

## Cómo ejecutar

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm run test       # tests del motor de cálculo
npm run typecheck  # comprobación de tipos
npm run ingest     # valida los datos contra las fuentes (ver data/README.md)
```

## Analítica (PostHog)

Para entender el tráfico y el uso, la app envía eventos a **PostHog** (nube UE).
La clave de proyecto va incrustada (`lib/analytics.ts`): es una clave *de solo
escritura*, pensada para vivir en el cliente, así que el sitio desplegado mide sin
configuración extra.

- **Solo en producción**: en `npm run dev` y en los tests no se envía nada
  (`POSTHOG_ENABLED` exige `NODE_ENV=production`).
- **Sin cookies de identidad**: `person_profiles: "identified_only"`; se cuenta el
  tráfico anónimo sin crear un perfil por visitante.
- **Proxy de primera parte**: el cliente apunta a `/ingest`, reescrito a
  `eu.i.posthog.com` en `next.config.mjs`, para esquivar la mayoría de
  bloqueadores. (En un despliegue 100 % estático sin _rewrites_, pon
  `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.)
- **Páginas vistas**: se capturan por `pathname` (sin el token `?e=`), de modo que
  compartir o ajustar un escenario no infla el recuento.

Variables de entorno opcionales (ver `.env.example`): `NEXT_PUBLIC_POSTHOG_KEY`
(cambiar de proyecto o poner `""` para desactivar), `NEXT_PUBLIC_POSTHOG_HOST`,
`NEXT_PUBLIC_POSTHOG_UI_HOST`.

Además de las páginas vistas y el _autocapture_ de clics, se registran eventos de
uso: `taxes_modal_opened`, `tax_tab_selected`, `tax_adjusted`,
`spending_adjusted`, `building_selected`, `country_template_loaded` /
`country_template_reset`, `scenario_shared`, `help_opened` e
`intro_completed` / `intro_skipped`.

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
  con la recaudación oficial y se aplica la misma calibración al escenario. Como el
  perímetro son las Administraciones Públicas, el IRPF cuenta íntegro (Estado + CCAA).
- **IS**: anclado a la recaudación real; el tipo general escala proporcionalmente.
  Se muestra el tipo efectivo (≈ 22 %) frente al nominal (25 %).

Detalle completo y limitaciones en `/metodologia` y en
[`data/README.md`](./data/README.md).

## Perímetro

Perímetro **Administraciones Públicas** (AAPP, sector S.13 de la contabilidad
nacional): Estado, CCAA, entidades locales y Seguridad Social, consolidados. El
gasto se clasifica por **función (COFOG, Eurostat)** en 10 áreas; cada una incluye
lo que ejecutan las CCAA o la Seguridad Social, con una línea de "de lo cual lo
ejecutan las CCAA / la Seguridad Social". Así Sanidad y Educación salen a tamaño
real y las plantillas de país son directamente comparables.

## Roadmap

- **Hecho**: IRPF + IS editables; edición del gasto por función; perímetro AAPP con
  desglose CCAA/Seguridad Social; plantillas de país (Eurostat/OCDE); compartir
  escenario por URL; perfil político; tutorial; versión móvil.
- **Siguiente**: IVA por categorías, versión en inglés, sonido retro, pulido del
  arte del tablero, galería de escenarios.

## Créditos y licencias

- Datos de gasto e ingresos de **Eurostat** (cuentas de las AAPP y clasificación
  funcional COFOG), con anclas de **AEAT**, **INE** y **Seguridad Social**.
- Fuentes tipográficas Press Start 2P y Silkscreen bajo SIL OFL 1.1
  (ver `public/fonts/LICENSE.md`).
- Activos visuales 100 % originales; ninguna marca, sprite o nombre de juegos
  comerciales.
