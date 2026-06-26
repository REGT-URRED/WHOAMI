---
description: Plan-only mode — generates plans but does NOT execute
agent: planner
subtask: true
---

# /plan — Modo Planificación

$ARGUMENTS

## Modo operativo

Estás en **modo plan-only**. Tu única responsabilidad es planificar. No ejecutas ni despliegas agentes.

1. **Analiza el input**: Determina tipo, alcance, stack
2. **Clasifica**: scope, tier, agentes necesarios
3. **Planifica**: Camino óptimo con enfoques y riesgos

**NO ejecutes.** No despliegues agentes. No escribas código. No toques archivos.

## Formato de entrega

```
## Plan: [título]

### Clasificación
- Tipo: [reverse|build|fix|refactor|mixto]
- Tier: [T1|T2|T3|T4]
- Stack: [TypeScript|Python|Go|Rust|...]
- Agentes previstos: [lista]

### Camino óptimo seleccionado
- Approach: [descripción breve]
- Criterios: menor código / menos dependencias / alineación / testabilidad / simplicidad

### Pipeline de ejecución
1. Fase 1: [agente(s)] → [resultado esperado]
2. Fase 2: [agente(s)] → [resultado esperado]
...

### Riesgos y dependencias
- [riesgo 1]
- [dependencia 1]

### Archivos involucrados
- [lista de archivos clave]

### Estimated complexity
[TIER] · [X fases] · [Y agentes] · [Z iteraciones estimadas]
```

**WAITING FOR CONFIRMATION**: ¿Procedo con este plan? (yes/no/modify)

---

**CRITICAL**: NO ejecutar. NO escribir código. NO desplegar agentes. Solo planificar.
