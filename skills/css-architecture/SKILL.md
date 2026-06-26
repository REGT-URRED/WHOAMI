---
name: css-architecture
description: >
  Arquitectura CSS escalable usando ITCSS (Inverted Triangle CSS) con
  nomenclatura BEM. 7 capas de menos a mas especifico: Settings → Tools
  → Generic → Elements → Objects → Components → Utilities.
origin: ITCSS + BEM + frontie-webpack
---

# CSS Architecture — ITCSS + BEM

Arquitectura CSS organizada en 7 capas de menor a mayor especificidad.

## Las 7 Capas ITCSS

### Layer 1: Settings (settings/)
Variables y tokens de diseno. Sin output CSS directo.

```scss
// settings/_colors.scss
$color-primary: #01696f;
$color-surface: #f7f6f2;
$color-text: #28251d;

// settings/_typography.scss
$font-family-body: 'Satoshi', sans-serif;
$font-family-heading: 'Boska', serif;
$font-size-base: 1rem;

// settings/_spacing.scss
$space-unit: 4px;
$space-sm: 4px;
$space-md: 16px;
$space-lg: 32px;
```

### Layer 2: Tools (tools/)
Mixins y funciones reutilizables. Sin output CSS directo.

```scss
// tools/_mixins.scss
@mixin respond-to($breakpoint) { ... }
@mixin sr-only { ... }

// tools/_functions.scss
@function rem($px) { @return $px / 16 * 1rem; }
```

### Layer 3: Generic (generic/)
Reset, normalize, box-sizing. CSS global de reset.

```scss
// generic/_reset.scss
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```

### Layer 4: Elements (elements/)
Estilos para elementos HTML desnudos (sin clases).

```scss
// elements/_headings.scss
h1, h2, h3 { font-family: $font-family-heading; line-height: 1.1; }
h1 { font-size: 2.5rem; }

// elements/_links.scss
a { color: $color-primary; text-decoration: none; }
```

### Layer 5: Objects (objects/)
Patrones de layout reutilizables y agnosticos al contenido.

```scss
// objects/_container.scss
.o-container { max-width: 1200px; margin: 0 auto; padding: 0 $space-md; }

// objects/_grid.scss
.o-grid { display: grid; gap: $space-md; }
.o-grid--2 { grid-template-columns: repeat(2, 1fr); }
.o-grid--3 { grid-template-columns: repeat(3, 1fr); }

// objects/_stack.scss
.o-stack { display: flex; flex-direction: column; gap: $space-md; }
```

### Layer 6: Components (components/)
UI components con nomenclatura BEM. LA CAPA PRINCIPAL.

```scss
// components/_card.scss
.c-card {
  background: $color-surface;
  border-radius: 8px;
  padding: $space-md;

  &__title {
    font-family: $font-family-heading;
    font-size: 1.25rem;
  }

  &__body {
    color: $color-text;
  }

  &--featured {
    border: 2px solid $color-primary;
  }
}
```

### Layer 7: Utilities (utilities/)
Helpers !important. Solo aqui se permite !important.

```scss
// utilities/_visibility.scss
.u-hidden { display: none !important; }
.u-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
.u-text-center { text-align: center !important; }
```

## BEM Naming Convention

```
.block {}                    → Componente
.block__element {}           → Elemento dentro del componente
.block--modifier {}          → Variante del componente
.block__element--modifier {} → Elemento variante
```

Ejemplos:
```
.c-card                    → componente card
.c-card__title             → titulo dentro de card  
.c-card--featured          → card destacada
.c-card__title--large      → titulo grande dentro de card
```

Prefijos BEM recomendados:
- `.c-` components
- `.o-` objects (layout)
- `.u-` utilities
- `.is-` / `.has-` states (is-active, has-error)
- `.js-` JavaScript hooks (no CSS)

## Reglas de CSS

1. **NUNCA** usar ID selectors (#id) para estilos. Usar clases BEM.
2. **NUNCA** usar !important excepto en layer 7 (utilities).
3. **NUNCA** anidar mas de 3 niveles en SCSS.
4. **SIEMPRE** usar variables/tokens en lugar de valores hardcodeados.
5. **PREFERIR** selectores de clase sobre selectores de elemento.
6. **EVITAR** selector universal (*) para performance.
7. **PREFERIR** gap en flex/grid sobre margins entre items.
8. **Mobile-first**: escribir base sin media query, luego @media min-width.
9. **Cada componente** en su propio archivo .css/.scss.
10. **No importar** estilos de componente dentro de otro componente.

## Orden de Propiedades CSS

```css
.c-card {
  /* Positioning */
  position: relative;
  z-index: 1;

  /* Display & Box Model */
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 100px;
  padding: 16px;
  margin: 0;

  /* Typography */
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);

  /* Visual */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  /* Misc */
  cursor: pointer;
  transition: box-shadow 0.2s;
}
```

## Validacion

- No ID selectors en CSS
- No !important fuera de utilities/
- BEM naming correcto (prefijo + bloque + elemento + modificador)
- 7 ITCSS layers respetadas
- Mobile-first media queries
