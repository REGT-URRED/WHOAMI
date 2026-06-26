---
name: reverse-methodology
description: >
  Metodologia completa de REVERSE engineering para WHOAMI: protocolo de 5
  pasos, clasificacion por tipo/rol, handoff JSON schemas, rigor de
  evidencia (HECHO/HIPOTESIS/VALIDADO/PENDIENTE), arbol de decision para
  gaps. Cargar via skill("reverse-methodology") cuando WHOAMI detecta
  tareas de ingenieria inversa, analisis de archivos, o deduccion de
  reglas.
origin: WHOAMI
---

# REVERSE Engineering — Metodologia Completa

Cuando el tipo de tarea es `reverse`, aplica esta metodologia rigurosa. No es un pipeline de build — es un ciclo de descubrimiento con evidencia.

## Protocolo Reverse (5 pasos obligatorios)

### Paso 1: Inventario Completo

Explora todos los archivos y clasifica cada uno por TIPO y ROL:

**Por TIPO:**
excel, csv, json, xml, pdf, docx, txt, script, log, db, api, html, imagen, desconocido

**Por ROL:**
- entrada -> datos fuente, inputs del proceso
- salida -> resultados, outputs generados
- intermedio -> archivos temporales, transformaciones parciales
- auxiliar -> documentacion, logs, evidencia de contexto

Detecta anomalias y relaciones entre archivos.

### Paso 2: Analisis Estructural

Examina cada archivo antes de proponer reglas:
- Metadatos, encabezados, formatos, validaciones
- Compara archivos base vs procesados
- Identifica columnas, hojas, campos, endpoints, payloads
- NO inferir sin haber analizado estructura primero

### Paso 3: Formulacion de Hipotesis

Formula hipotesis EXPLICITAS sobre transformaciones y reglas:
- "input X produce output Y porque..."
- "el campo A se transforma en B mediante..."
- "cuando C esta ausente, el valor por defecto es D..."

Cada hipotesis debe tener evidencia observable. No especules.

### Paso 4: Validacion (busqueda de contraejemplos)

Para cada hipotesis, busca activamente evidencia que la refute:
- Archivos que no siguen el patron propuesto
- Casos borde: valores nulos, datos malformados, excepciones
- Si encuentras un contraejemplo, la hipotesis se ajusta o descarta

### Paso 5: Documentacion y Propuesta de Automatizacion

Redacta el plano final del proceso observado:
1. Mapa del proceso con entradas, salidas e intermedios
2. Reglas detectadas con su evidencia y nivel de confianza
3. Excepciones y ambiguedades encontradas
4. Propuesta de automatizacion, replicacion o extraccion de conocimiento
5. Codigo de transformacion si aplica

## Rigor de Evidencia

Cada hallazgo DEBE marcarse con una de estas etiquetas:

- **[HECHO]** observado directamente en los datos
- **[HIPOTESIS]** inferido logicamente pero no confirmado
- **[VALIDADO]** confirmado por contraejemplos fallidos o por el usuario
- **[PENDIENTE]** no determinado por falta de evidencia

## Arbol de Decision para Gaps

Al finalizar el analisis:

```
Gaps > 30% del proceso no documentado?
  → REDEPLOYAR hypothesis + validator con mas muestras

Gaps entre 10-30%?
  → Documentar como PENDIENTE, incluir que falta

Gaps < 10%?
  → Documentar como HECHO, proceder a spec-writer

Proceso completo y validado?
  → reverse-spec-writer produce el plano final
```

## Pipeline de Agentes REVERSE

```
WHOAMI clasifica → 
  [inventario + analisis estructural] → 
  reverse-explorer → 
  reverse-hypothesis → 
  reverse-validator → 
  reverse-spec-writer

Ciclo iterativo:
  gaps → redeployar hypothesis + validator
  evidencia suficiente → spec-writer
```

## Handoff JSON Schemas

Cada agente REVERSE debe entregar un output estructurado:

### reverse-explorer output:
```json
{
  "inventario": [
    { "path": "ruta", "tipo": "csv|json|...", "rol": "entrada|salida|intermedio|auxiliar",
      "lineas": 100, "columnas": ["A","B"], "anomalias": ["notas"] }
  ],
  "relaciones": ["archivo X alimenta a Y"],
  "total_clasificados": 10,
  "total_anomalias": 2
}
```

### reverse-hypothesis output:
```json
{
  "hipotesis": [
    { "id": "H1", "descripcion": "input A produce output B",
      "evidencia": ["archivo X linea Y"], "confianza": "alta|media|baja" }
  ],
  "dependencias": ["H1 depende de H2"],
  "total_hipotesis": 3
}
```

### reverse-validator output:
```json
{
  "resultados": [
    { "hipotesis_id": "H1", "estado": "VALIDADO|REFUTADO|PENDIENTE",
      "contraejemplos": [], "confianza_final": "alta" }
  ],
  "cobertura": "80%",
  "recomendacion": "proceder|reeditar|mas_muestras"
}
```

### reverse-spec-writer output:
```json
{
  "proceso": { "nombre": "...", "descripcion": "...", "pasos": [] },
  "reglas": [ { "patron": "...", "transformacion": "...", "confianza": "alta" } ],
  "excepciones": ["caso X no cubierto"],
  "automatizacion": "propuesta de script o herramienta"
}
```
