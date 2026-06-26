---
description: Audita el repositorio COMPLETO por sobre-ingeniería y código inflado — aplica la Escalera de Optimalidad a todo el codebase
agent: ramon
subtask: true
---

# /audit-open — Auditoría de Repositorio

$ARGUMENTS

Ejecuta una auditoría COMPLETA del repositorio para detectar:
- Código muerto, no usado
- Abstracciones prematuras
- Dependencias no utilizadas
- Código que podría reemplazarse por stdlib/nativo
- Boilerplate innecesario

## Pipeline de auditoría

1. Ejecuta herramientas de detección:
   - `npx knip` (código no usado)
   - `grep` para patrones de sobre-ingeniería
2. Analiza archivos por tipo:
   - Interfaces con 1 sola implementación
   - Factories que producen 1 solo tipo
   - Archivos de configuración con valores estáticos
   - Ficheros >500 líneas
3. Aplica la escalera de optimalidad por módulo
4. Reporta hallazgos con archivos específicos

## Entrega

```
## Auditoría de Repositorio: [nombre]

### Resumen
- Archivos analizados: X
- Líneas candidatas a eliminar: ~Y
- Dependencias no usadas: Z

### Por categoría

[Código muerto]
  - archivo.ts:123 - función X no tiene callers

[Abstracciones prematuras]
  - archivo.ts:45 - interfaz con 1 implementación

[Stdlib candidate]
  - archivo.ts:67 - reemplazar lodash.get por optional chaining

[Dependencias no usadas]
  - lodash@4.17.21 - no importado en ningún archivo

### Recomendación
[ESTABLE / NECESITA LIMPIEZA / REQUIERE REFACTOR MAYOR]
```
