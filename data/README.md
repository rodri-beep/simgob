# Datos — Presupuestópolis

Todos los datos están anclados al ejercicio **2023** y proceden de fuentes
públicas. El año está parametrizado (`BASE_YEAR`) para facilitar futuras
actualizaciones.

## Ficheros

| Fichero | Contenido | Fuente |
|---|---|---|
| `meta.json` | Año base, PIB, totales del perímetro, déficit AAPP de contexto, fuentes | INE, Hacienda, AEAT, Civio |
| `revenue.json` | Ingresos del perímetro estatal por línea (suma 400.009,3 M€) | Civio (PGE 2023) |
| `spending.json` | Gasto por política (27 políticas, suma 450.721,5 M€) | Civio (PGE 2023) |
| `irpf.json` | Distribución por tramos (declarantes, base, cuota), escala y ancla | AEAT |
| `is.json` | Recaudación, base imponible, cuota líquida, tipos | AEAT |
| `buildings.json` | Metadatos de los distritos del tablero | — |
| `human.json` | "Historias": población, hogares, modelo bruto→neto, anclas por beneficiario (pensiones, desempleo) | INE, Seg. Social, SEPE, AEAT/BOE |
| `raw/` | Ficheros oficiales descargados (trazabilidad) | — |

## Cifras clave 2023 (verificadas)

- Recaudación tributaria total: **271.935 M€** (IRPF 120.280 · IVA 83.909 · IS 35.060 · IIEE 20.757).
- IRPF: 23.987.211 declaraciones; base liquidable general 534.780 M€, ahorro 42.271 M€; cuota líquida 118.143 M€.
- IS: base imponible positiva 146.424 M€, cuota líquida 32.142 M€ → tipo efectivo ≈ 22 %.
- PGE perímetro estatal (Civio): ingresos 400.009 M€, gasto 450.721 M€ → saldo −50.712 M€.
- PIB nominal 2023 (INE): 1.498.324 M€. Déficit AAPP: 53.556 M€ (≈ 3,6 % PIB).

## Flujo de actualización anual

```
data/raw/        <- ficheros oficiales descargados (AEAT, Hacienda, Civio)
scripts/ingest   <- transforma raw -> JSON de la app
data/*.json      <- datos consumidos por la app (committeados)
```

1. Cuando se publiquen nuevos PGE/estadísticas, ejecuta:
   ```bash
   npm run ingest            # descarga fuentes, valida y muestra un informe
   npm run ingest -- --write # además regenera revenue.json y spending.json
   # o para otro año:
   BASE_YEAR=2024 npm run ingest -- --write
   ```
2. `revenue.json` y `spending.json` se regeneran automáticamente desde los CSV de
   Civio (perímetro estatal). Las líneas de ingresos se agrupan y las políticas de
   gasto se mapean a los distritos del tablero según el mapa del script.
3. `irpf.json`, `is.json` y `meta.json` se curan a mano a partir de las
   estadísticas de la AEAT (la ingesta los **valida** e imprime sus totales, pero
   no los reescribe, porque requieren transcripción de Excel/HTML oficiales).
4. Revisa los cambios y haz commit.

## Notas metodológicas

- Ingresos (recaudación/presupuesto) y gastos (presupuesto inicial) usan criterios
  distintos: el saldo es una **aproximación**, no el déficit oficial.
- El IRPF de la tabla de ingresos es la **parte estatal**; la simulación usa la
  recaudación **nacional** bruta (120.280 M€) y reparte el efecto ~50/50 con las
  CCAA.
- El IS no consolidado no refleja la cuota real de los grupos (modelo 220); se
  ancla a la recaudación.
- Datos agrupados por tramo (no individuales) y sin respuesta de comportamiento:
  el error es mayor en el tramo superior.
