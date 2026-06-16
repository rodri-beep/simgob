# Datos — SimGob

Todos los datos están anclados al ejercicio **2023** y proceden de fuentes
públicas. El perímetro es el de las **Administraciones Públicas** (AAPP, sector
S.13 de la contabilidad nacional): Estado, CCAA, entidades locales y Seguridad
Social, consolidados.

## Ficheros

| Fichero | Contenido | Fuente |
|---|---|---|
| `meta.json` | Año base, PIB, totales del perímetro AAPP, déficit, fuentes | Eurostat, AEAT, INE, IGAE |
| `revenue.json` | Ingresos de las AAPP por tipo (suma 630.198 M€) | Eurostat `gov_10a_main`; IRPF/IS anclados a AEAT |
| `spending.json` | Gasto por función COFOG (12 líneas en 10 funciones, suma 680.952 M€) | Eurostat `gov_10a_exp` |
| `irpf.json` | Distribución por tramos (declarantes, base, cuota), escala y ancla | AEAT |
| `is.json` | Recaudación, base imponible, cuota líquida, tipos | AEAT |
| `buildings.json` | Metadatos de las funciones del tablero + reparto por subsector ("de lo cual CCAA/Seg. Social") | Eurostat `gov_10a_exp` |
| `human.json` | "Historias": población, hogares, modelo bruto→neto, anclas por beneficiario (pensiones, desempleo) | INE, Seg. Social, SEPE, AEAT/BOE |
| `raw/` | Ficheros oficiales descargados (trazabilidad) | — |

## Cifras clave 2023 (verificadas)

- Recaudación tributaria total (AEAT): IRPF 120.280 · IVA 83.909 · IS 35.060 · IIEE 20.757.
- IRPF: 23.987.211 declaraciones; base liquidable general 534.780 M€, ahorro 42.271 M€.
- IS: base imponible positiva 146.424 M€, cuota líquida 32.142 M€ → tipo efectivo ≈ 22 %.
- **AAPP (Eurostat)**: ingresos 630.198 M€, gasto 680.952 M€ → saldo −50.754 M€ (≈ −3,4 % PIB).
- Gasto por función (COFOG, gov_10a_exp): Protección social 277.327 · Sanidad 98.630
  (CCAA 92.287) · Educación 62.532 (CCAA 56.688) · Servicios generales 84.425 ·
  Asuntos económicos 74.851 · Orden 27.414 · Cultura 18.638 · Medio ambiente 14.579 ·
  Defensa 14.008 · Vivienda 7.821. Suma 680.225; al total AAPP (680.952) se le imputa
  un ajuste de conciliación de ≈ 727 M€ a Servicios generales.
- PIB nominal 2023 (Eurostat/INE): 1.497.761 M€.

## Actualización anual

`npm run ingest` carga los JSON committeados y **valida** que los totales cuadran
con el perímetro (ingresos, gastos, saldo, anclas de IRPF/IS). No descarga ni
reescribe: los datos de AAPP se transcriben a mano desde Eurostat y la AEAT, así
que para actualizar a un nuevo año se editan los JSON y se vuelve a validar.

## Notas metodológicas

- Ingresos y gastos proceden de series de Eurostat con criterios homogéneos
  (contabilidad nacional): el saldo base reproduce el déficit oficial de las AAPP.
- El IRPF y el IS se cuentan **íntegros** (todas las administraciones): el cambio
  simulado se traslada por completo al saldo (`stateDeltaShare` = 1.0).
- En `gov_10a_exp` el reparto por subsector está consolidado por función (la suma
  de subsectores coincide con el total de cada función); por eso "de lo cual CCAA /
  Seg. Social" es fiable. La excepción es Servicios generales (intereses de deuda y
  transferencias entre administraciones), donde el reparto por subsector no es fiable.
- El IS no consolidado no refleja la cuota real de los grupos (modelo 220); se
  ancla a la recaudación.
- Datos agrupados por tramo (no individuales) y sin respuesta de comportamiento:
  el error es mayor en el tramo superior.
