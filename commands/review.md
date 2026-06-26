---
description: Audita el diff actual por sobre-ingeniería aplicando la Escalera de Optimalidad — identifica abstracciones innecesarias, código inflado, y sugiere eliminaciones
agent: code-reviewer
subtask: true
---

# /review — Auditoría de Optimalidad

$ARGUMENTS

Ejecuta la ETAPA 5 de WHOAMI con foco exclusivo en optimalidad.

## Pipeline de revisión

1. Captura el diff actual (`git diff`) o revisa los cambios recientes
2. Por cada archivo modificado, aplica los 7 peldaños de la escalera:
   - ¿Cada línea nueva es necesaria?
   - ¿Hay abstracciones no solicitadas?
   - ¿Se pudo usar stdlib/nativo/dependencia ya instalada?
3. Identifica candidatos a eliminación o simplificación
4. Reporta hallazgos

## Reglas de revisión

- **CRÍTICO**: Código que agrega dependencias nuevas sin necesidad justificada
- **ALTO**: Abstracciones prematuras (interfaces de 1 impl, factories de 1 producto)
- **MEDIO**: Boilerplate, scaffolding "para después", comentarios innecesarios
- **SUGERENCIA**: Oportunidades de simplificación menor

## Entrega

```
## Review de Optimalidad

### Archivos revisados: [X]
### Líneas candidatas a eliminar: ~Y

### Hallazgos

[CRÍTICO] ...
[ALTO] ...
[MEDIO] ...
[SUGERENCIA] ...

### Resumen
- Código que se puede eliminar: ~X líneas
- Dependencias innecesarias: Y
- Abstracciones prematuras: Z
- Score de optimalidad: [APROBADO / NECESITA MEJORA]
```
