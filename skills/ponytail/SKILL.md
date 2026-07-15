---
name: ponytail
description: >
  Integracion del patron Ponytail (7-rung Optimality Ladder) en el
  Orchestrator de WHOAMI. Cada delegacion de agente pasa por la escalera:
  YAGNI → reuso → stdlib → nativo → dependencia instalada → 1 linea →
  codigo minimo. Activado por defecto en el Orchestrator v2.
origin: Ponytail + WHOAMI Orchestrator
---

# Ponytail Skill — 7-Rung Optimality Ladder en Orchestrator

El patron Ponytail esta integrado directamente en el Orchestrator de WHOAMI como `OptimalityLadder` class.

## Implementacion

```typescript
// packages/orchestrator/src/orchestrator.ts
export class OptimalityLadder {
  static evaluate(description: string, codeSnippet: string): LadderCheck[]
  static highestPassedRung(checks: LadderCheck[]): number
}
```

## La Escalera de 7 Peldaños

Cada vez que el Orchestrator despliega un agente o revisa codigo, aplica estos 7 peldaños:

| Peldaño | Pregunta | Heuristica |
|---------|----------|------------|
| 1 | YAGNI — realmente necesita existir? | Codigo especulativo sin uso actual |
| 2 | Reuso — ya existe en el codebase? | Busca imports/util existentes |
| 3 | Stdlib — la libreria estandar lo hace? | fs, path, JSON, Math, Date, etc. |
| 4 | Nativo — la plataforma lo cubre? | HTML nativo, CSS, DB constraints |
| 5 | Dependencia instalada? | Ya instalada en package.json? |
| 6 | Una linea? | Puede ser 1 linea en vez de N? |
| 7 | Minimo que funciona? | Es el diff mas pequeño posible? |

## Integracion en verifyGates()

El Orchestrator ejecuta `OptimalityLadder.evaluate()` como parte de `verifyGates()`. Si el peldaño maximo alcanzado es < 2, la gate `optimality` retorna FAIL.

## Reglas de Optimalidad

Aplicadas automaticamente por el Orchestrator:

1. **Sin abstracciones no solicitadas** — no interfaces de 1 impl, no factories de 1 producto
2. **Sin scaffolding "para despues"** — el futuro puede scaffoldear solo
3. **Eliminacion sobre adicion** — el mejor codigo es el que no existe
4. **Bug fix = causa raiz** — una guarda en la funcion compartida, no parche en cada caller
5. **Hardware real necesita calibracion** — no simplifiques el mundo fisico

## Cuando NO aplicar

- Validacion en trust boundaries
- Error handling que previene perdida de datos
- Medidas de seguridad
- Accesibilidad basica
- Lo que el usuario pidio explicitamente

## Output del Orchestrator

```typescript
const ladder = OptimalityLadder.evaluate('my change', code);
const rung = OptimalityLadder.highestPassedRung(ladder);
// rung 7 = codigo minimo
// rung 1 = posible sobre-ingenieria
```

Los resultados se incluyen en `verifyGates()` como la gate `optimality: PASS/FAIL`.
