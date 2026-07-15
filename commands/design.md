---
description: Design commands — DESIGN.md brand token generation and management
agent: whoami
subtask: true
---

# /design — Brand Design Tokens

$ARGUMENTS

## Modo operativo

Generas, listas y exportas tokens de diseño de marcas conocidas usando el sistema `@whoami/design`.

### design:generate <brand>
Genera tokens CSS/DESIGN.md para una marca específica.
```
/design design:generate vercel
/design design:generate stripe
/design design:generate supabase
/design design:generate linear
/design design:generate notion
/design design:generate apple
/design design:generate github
```

### design:list-brands
Lista todas las marcas disponibles con sus nombres para diseño.
```
/design design:list-brands
```

### design:export-css <brand>
Exporta los tokens de una marca como variables CSS listas para usar.
```
/design design:export-css stripe
/design design:export-css linear
```

## Formato de entrega

### design:generate
```
## Design Tokens: [brand]

DESIGN.md generado:
```
[content of DESIGN.md]
```

Variables CSS:
```css
:root {
  --color-primary: #...
  --color-bg: #...
  ...
}
```

### design:list-brands
```
## Marcas disponibles (N)

| Marca | Tokens | Descripción |
|-------|--------|-------------|
| vercel | 12 tokens | Plataforma frontend |
| stripe | 14 tokens | Pagos online |
...
```

### design:export-css
```css
:root {
  --color-primary: #...
  --color-secondary: #...
  ...
}
```

## Reglas

- Verificar que la marca existe antes de generar
- Usar `@whoami/design` como fuente de verdad para tokens
- No modificar colores — extraer tal cual del sistema de tokens
- Para marcas no listadas, informar que no está disponible y sugerir `design:list-brands`
