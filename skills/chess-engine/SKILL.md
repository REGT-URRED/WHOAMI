---
name: chess-engine
description: >
  Simulación predictiva pre-ejecución — antes de modificar cualquier archivo,
  WHOAMI traza el mapa de impacto completo: dependientes, tests, consumidores,
  historial git, y riesgos cross-layer (frontend↔backend). Piensa 2 pasos
  adelante como en ajedrez.
origin: WHOAMI v2
---

# Chess Engine — Simulación Predictiva

Antes de escribir UNA SOLA línea de código en una fase BUILD/FIX/REFACTOR,
ejecuta esta simulación mental para cada archivo que planeas modificar:

## Mapa de Impacto

Para cada archivo en `archivos_a_modificar[]`:

### 1. Dependencias Entrantes (quién me usa)
- `grep -rn "from '.*{filename}'" src/` o `grep -rn "import.*{filename}" src/`
- Listar todos los archivos que importan este módulo
- Si son >5 archivos compartidos → alto riesgo, proceder con cuidado

### 2. Tests Relacionados
- Buscar `{filename}.test.*`, `{filename}.spec.*`, `__tests__/{filename}*`
- Si NO hay tests → alto riesgo (no hay safety net)
- Si hay tests → review rápida: ¿cubren el área que voy a tocar?

### 3. Consumidores Cross-Layer
- Si el archivo es BACKEND (API route, service, DB query):
  - ¿Quién lo consume en frontend? → grep de fetch/axios por endpoint/ruta
  - ¿Cambia el contrato? → actualizar tipos/interface primero
- Si el archivo es FRONTEND (component, hook, page):
  - ¿Qué API consume? → verificar que los endpoints existen y devuelven lo esperado
  - ¿Cambia el contrato visual? → verificar que backend soporta el cambio

### 4. Migraciones y Schema
- Si toca DB: listar migraciones en orden, verificar que no hay conflictos
- Si toca types: verificar que el schema de DB coincide con los tipos

### 5. Git History
- `git log --oneline -10 {filename}` — ¿hay cambios similares?
- `git log --oneline --grep="{descripcion}"` — ¿algo similar ya se intentó?
- Si hay revert commits → entender por qué se revirtió antes de repetir

## Chess Matrix

| Archivo | Dependientes | Tests | Cross-layer | Git risk | Impacto |
|---------|-------------|-------|-------------|----------|---------|
| src/api/users.ts | 12 | 3 | 5 FE pages | Ninguno | ALTO |
| src/components/Login.tsx | 2 | 1 | 1 API call | 2 reverts | MEDIO |
| src/lib/utils.ts | 45 | 0 | — | Ninguno | CRITICO |

## Output de la simulación

```
## Simulación Pre-Ejecución

### Archivos a modificar
- src/api/users.ts — 12 dependientes, 3 tests, 5 consumidores FE → ALTO RIESGO
- src/components/Login.tsx — 2 dependientes, 1 test → MEDIO

### Riesgos detectados
- No hay tests para src/lib/utils.ts (45 dependientes) — CRÍTICO
- git log muestra 2 reverts en Login.tsx — revisar antes de tocar

### Plan de contingencia
- Si users.ts falla: afecta 12 archivos → rollback inmediato, no iterar
- Si Login.tsx falla: solo 2 dependientes → intentar fix directo

### Plan B
- Si architect no puede con users.ts: whoami toma el control directo
- Si tdd-guide no pasa tests para Login.tsx: ramon + build-error-resolver
```
