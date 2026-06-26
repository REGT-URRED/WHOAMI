---
name: whoami-frontend
description: >
  Reglas de diseno frontend para WHOAMI durante BUILD de UI: Atomic Design
  Hierarchy, Design Tokens (System UI spec), FSM Components (Radix),
  Accessibility First (WCAG AA), Responsive Mobile-First, CSS Architecture
  (ITCSS + BEM). Cargar via skill("whoami-frontend") cuando WHOAMI ejecuta
  BUILD frontend (React, Vue, Tailwind, CSS).
origin: WHOAMI
---

# WHOAMI Frontend — Reglas de Diseno

## R1 — Atomic Design Hierarchy

Todo componente frontend organizado en 5 capas:

| Capa | Contenido | Regla |
|------|-----------|-------|
| atoms/ | Button, Input, Label, Icon | Sin margins propios. Sin posicionamiento |
| molecules/ | SearchBar, FormField | Posiciona atomos. Sin margins externos |
| organisms/ | Header, DataTable, Modal | Forma final visible. Sin estilos de layout |
| templates/ | DashboardLayout, AuthLayout | Solo grid. Sin contenido real |
| pages/ | HomePage, LoginPage | Conecta datos reales con componentes |

Los imports solo van hacia abajo: pagina -> template -> organismo -> molecula -> atomo.

## R2 — Design Tokens (System UI Spec)

NUNCA hardcodear valores de diseno. Usar sistema de tokens estandarizado:

```
space: [0, 4, 8, 12, 16, 24, 32, 48, 64]
  space[0]=0, space.small=4, space.md=16, space.lg=32
fontSizes: [12, 14, 16, 20, 24, 32, 48]
  fontSizes.body=16, fontSizes.h1=32
colors: { primary, secondary, accent, surface, background, text, textMuted, error, success, warning }
  cada color tiene proposito definido (no decorativo)
fonts: { body, heading, mono }
fontWeights: { normal: 400, bold: 700 }
lineHeights: { body: 1.5, heading: 1.1 }
breakpoints: ['40em', '52em', '64em'] -> mediaQueries derivados
radii: [0, 4, 8, 12, 9999]  // full=9999
shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 12px rgba(0,0,0,0.08)' }
  maximo 2 niveles de shadow
```

Convenciones:
- Keys en PLURAL: fontSizes, colors, radii, shadows
- Arrays para valores ordinales (space, fontSizes). Objetos para valores nombrados (colors).
- space[0] = 0 siempre
- breakpoints generan mediaQueries: @media (min-width: 40em)

## R3 — FSM Components (Radix-based)

Cada componente con estado USA data-state con strings, NUNCA booleanos:

```
data-state="open|closed"          -> dropdown, accordion, modal
data-state="checked|unchecked"    -> checkbox, toggle
data-state="active|inactive"      -> tab, nav link
data-state="loading|loaded|empty|error" -> data components

NUNCA: isOpen={true}, data-open="true", expanded={true}
SIEMPRE: data-state="open", aria-expanded="true"

CSS: [data-state="open"] { ... }
```

Reglas Radix:
- 1 componente = 1 DOM element (1-to-1)
- Composition sobre configuracion
- Controlled (value+onChange) vs Uncontrolled (defaultValue)
- Estados documentados en comentarios del componente

## R4 — Accessibility First (WCAG AA)

Cada componente DEBE incluir:
- Rol semantico: `<button>`, `<nav>`, `role="dialog"`, `aria-expanded`
- Keyboard: Tab, Enter, Escape, Arrow keys
- Focus management: trap en modales, restore al cerrar
- Color contrast: ratio 4.5:1 minimo (AA)
- Touch targets: 44x44px minimo
- Screen reader: aria-label, aria-live, role="status"
- Reduced motion: prefers-reduced-motion: reduce

## R5 — Responsive Mobile-First

- Base sin media query = mobile (<640px): 1 columna, full-width
- @media (min-width: 640px): 2 columnas
- @media (min-width: 1024px): 3+ columnas, sidebars fijas
- No horizontal scroll. Touch targets 44px. Imagenes con srcset.

## R6 — CSS Architecture (ITCSS + BEM)

7 capas ITCSS en orden: Settings -> Tools -> Generic -> Elements -> Objects -> Components -> Utilities
Nomenclatura BEM: `.c-block__element--modifier`
No ID selectors. No !important excepto en Utilities.
