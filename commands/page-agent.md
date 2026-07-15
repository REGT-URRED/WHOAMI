---
description: PageAgent commands — in-page GUI agent operations
agent: page-agent
subtask: true
---

# /page — PageAgent GUI Actions

$ARGUMENTS

## Modo operativo

Activas PageAgent para ejecutar acciones DOM en una página web.

### page:execute <instrucción>
Ejecuta una instrucción completa (planifica + ejecuta automáticamente).
```
/page page:execute "click the login button"
/page page:execute "type admin into username field"
/page page:execute "navigate to example.com"
/page page:execute "extract all product names and prices"
```

### page:click <selector>
Click directo sobre un elemento.
```
/page page:click "button[data-testid='submit']"
/page page:click "Login"
/page page:click "#main-nav a:first-child"
```

### page:type <selector> <texto>
Escribe texto en un campo.
```
/page page:type "username" "admin@example.com"
/page page:type "[name='password']" "secret123"
/page page:type "Search..." "weather today"
```

### page:extract <selector> [schema]
Extrae datos de la página con schema opcional.
```
/page page:extract ".product-card"
/page page:extract ".product-list" "{\"name\":\".title\",\"price\":\".price\"}"
/page page:extract "table tbody tr"
```

## Formato de entrega

```
## PageAgent Result

- Acciones ejecutadas: [N]
- Success: [true/false]
- Duración total: [Xms]

### Acciones
1. [type:click] → target: [selector] → [OK/FAIL] ([Xms])
2. ...

### Datos extraídos (si aplica)
```json
[...]
```

### Errores
- [si hay]
```
