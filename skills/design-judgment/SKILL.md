---
name: design-judgment
description: >
  Reglas practicas de juicio de diseno para que el UI generado no parezca
  "hecho por AI". Basado en styleseed (74 reglas, 48 componentes).
  Abarca jerarquia visual, espaciado, color, profundidad, iconos, estados,
  motion, densidad y white space.
origin: bitjaru/styleseed
---

# Design Judgment — Reglas de Buen Diseno Visual

Reglas practicas para que el UI generado tenga calidad visual profesional.

## R1 — Jerarquia Tipografica

```
MAXIMO 3 niveles de heading: h1, h2, h3
MAXIMO 2 font weights: regular + bold (nunca usar light, medium, semibold, bold, extrabold todos juntos)
MAXIMO 2 familias: 1 para headings + 1 para body
```

Ejemplo correcto:
- h1: 2.5rem, bold, font-heading
- h2: 1.75rem, bold, font-heading
- h3: 1.25rem, bold, font-heading
- body: 1rem, regular, font-body
- small: 0.875rem, regular, font-body

NUNCA: 6 niveles de heading con 4 pesos diferentes.

## R2 — Espaciado Consistente

```
SOLO usar valores del space scale: 4, 8, 12, 16, 24, 32, 48, 64
NUNCA valores como 7px, 13px, 19px, 27px
```

Regla de padding:
- padding minimo en cards: 16px (24px preferible)
- padding minimo en buttons: 8px vertical, 16px horizontal
- gap entre elementos: 8px o 16px (nunca 10px o 12px)
- section spacing: 48px o 64px

## R3 — Color con Proposito

```
Cada color tiene un proposito definido:
  primary  → acciones principales (botones CTA, links)
  secondary → acciones secundarias
  accent   → elementos destacados (badges, highlights)
  surface  → fondos de cards, modales
  background → fondo de pagina
  text      → texto principal
  text-muted → texto secundario
  error     → errores, validacion
  success   → confirmacion
  warning   → alertas
```

NUNCA: usar primary como color de fondo de pagina. NUNCA: mas de 1 color accent.

## R4 — Profundidad Sutil

```
MAXIMO 2 niveles de shadow diferentes:
  shadow-sm: 0 1px 2px rgba(0,0,0,0.05)  → cards, inputs
  shadow-md: 0 4px 12px rgba(0,0,0,0.08)  → modals, dropdowns

NO usar:
  shadow-lg, shadow-xl (excesivos)
  box-shadow con colores custom (usar tokens)
  text-shadow
```

El elevation se logra con color de fondo (surface mas claro/oscuro), no con sombras multiples.

## R5 — Bordes con Proposito

```
Usar borde SOLO para separar elementos. NUNCA decorar con bordes.

SI: border-bottom en header para separar del contenido
SI: border en inputs para delimitar area de interaccion
NO: border + shadow en el mismo elemento (elegir uno)
NO: border-radius > 12px en cards o modales
```

## R6 — Iconos Consistentes

```
UN solo set de iconos para todo el proyecto.
Lucide (recomendado para React), Heroicons, Phosphor.

NO mezclar icon libraries en el mismo proyecto.
NO usar emojis como iconos.
Siempre mismo tamano de icono dentro del mismo contexto (16px o 20px).
```

## R7 — Estados Visibles

```
Todo elemento interactivo DEBE tener 4 estados definidos:
  :hover    → cambio de color/fondo (opacidad 0.8 o color mas oscuro)
  :focus    → outline o ring visible (2-3px, color primary)
  :active   → escala 0.98 o color mas oscuro
  :disabled → opacidad 0.5, cursor not-allowed

NUNCA: elemento interactivo sin focus visible. NUNCA: outline: none sin alternativa.
```

## R8 — Motion con Significado

```
Cada animacion tiene un proposito:
  fade (opacity)     → aparecer/desaparecer elementos
  slide (translate)  → navegacion, panels laterales
  scale              → feedback de click, modals
  NO animar         → cambios de layout, resize, datos

NUNCA: animaciones > 500ms. NUNCA: animar 'all' (especificar propiedad).
```

## R9 — Densidad Visual

```
Maximo 3 elementos distintos en una "zona de atencion" (card, hero, section).

Ejemplo de card correcta:
  1. Imagen/icono
  2. Titulo + descripcion (cuentan como 1 bloque de texto)
  3. Boton de accion

Ejemplo de card INCORRECTA:
  1. Imagen
  2. Badge
  3. Titulo
  4. Subtitulo
  5. Descripcion
  6. Tags
  7. Boton primario
  8. Boton secundario
```

## R10 — White Space Generoso

```
padding > margin. Minimo 16px de padding en cualquier contenedor.

Reglas:
  - Cards: padding 24px
  - Buttons: padding 8px 16px (vertical, horizontal)
  - Inputs: padding 8px 12px
  - Section: padding 64px 0
  - Container: max-width 1200px, con padding lateral 16px

El espacio vacio NO es desperdicio. Es jerarquia visual.
```

## Checklist de Juicio de Diseno

- [ ] Maximo 3 niveles de heading + 2 pesos tipograficos
- [ ] Solo valores del space scale (4,8,16,24,32,48,64)
- [ ] Cada color usado tiene proposito definido
- [ ] Maximo 2 sombras diferentes en todo el proyecto
- [ ] Los bordes separan, no decoran
- [ ] Un solo set de iconos
- [ ] hover, focus, active, disabled definidos en todo elemento interactivo
- [ ] Animaciones proposito-especificas, duracion < 500ms
- [ ] Maximo 3 elementos por zona de atencion
- [ ] Padding minimo 16px en contenedores
