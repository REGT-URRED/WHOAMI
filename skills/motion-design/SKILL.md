---
name: motion-design
description: >
  Sistema de motion design nombrado para UI: 5 seeds (fade, slide, scale,
  reveal, pulse) con duraciones estandar, easing functions y soporte
  para prefers-reduced-motion. Basado en styleseed + buenas practicas UX.
origin: styleseed + Apple HIG + Material Design Motion
---

# Motion Design — Animaciones con Proposito

Sistema estandarizado de animaciones para UI. Cada animacion tiene un nombre,
una duracion y un proposito.

## Motion Seeds (5 categorias)

### fade — Aparecer/Desaparecer
```
Proposito: mostrar u ocultar elementos
CSS: opacity
Duracion: 150ms (fast) o 300ms (normal)

Ejemplos:
  - Tooltip aparece: fade 150ms ease-out
  - Toast desaparece: fade 300ms ease-in
  - Overlay de modal: fade 200ms ease-out
```

### slide — Navegar/Desplazar
```
Proposito: movimiento direccional (navegacion, panels)
CSS: transform: translateX/Y
Duracion: 300ms (normal)

Ejemplos:
  - Sidebar abre: slide-right 300ms ease-out
  - Dropdown abre: slide-down 200ms ease-out
  - Panel se cierra: slide-left 300ms ease-in
```

### scale — Feedback/Modals
```
Proposito: feedback de interaccion, modals
CSS: transform: scale
Duracion: 150ms (fast) o 300ms (normal)

Ejemplos:
  - Boton click: scale-down 95% 150ms ease-out
  - Modal abre: scale-up 95%→100% 300ms ease-out
  - Card hover: scale-up 102% 200ms ease-out
```

### reveal — Expandir/Colapsar
```
Proposito: expandir secciones, mostrar mas contenido
CSS: max-height, clip-path, grid-template-rows
Duracion: 300ms-500ms (normal/slow)

Ejemplos:
  - Accordion expande: reveal 300ms ease-out
  - FAQ answer muestra: reveal 300ms ease-out
```

### pulse — Loading/Notificacion
```
Proposito: indicar carga, atraer atencion
CSS: opacity oscilando, scale oscilando
Duracion: 1000ms-2000ms (loop)

Ejemplos:
  - Skeleton loading: pulse 1.5s ease-in-out infinite
  - Notification dot: pulse 2s ease-in-out infinite
```

## Duraciones Estandar

```
instant: 0ms     → cambios de estado sin animacion
fast: 150ms      → hover, focus, tooltips, feedback de click
normal: 300ms    → transiciones de UI, dropdowns, modals, navegacion
slow: 500ms      → entradas de pagina, transiciones complejas
```

## Easing Functions

```
ease-out    → para ENTRAR (decelerar al final)
               El elemento aparece rapido y se asienta suavemente

ease-in     → para SALIR (acelerar al final)
               El elemento empieza lento y acelera al desaparecer

ease-in-out → para LOOPS (pulse, carga)
               Animacion simetrica que no para

NO usar: linear (robotic), cubic-bezier custom (inconsistente)
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

SIEMPRE incluir este bloque. Los usuarios con sensibilidad a movimiento lo necesitan.

## Implementacion CSS

```css
/* Token system */
:root {
  --motion-fast: 150ms;
  --motion-normal: 300ms;
  --motion-slow: 500ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ejemplos de uso */
.fade-in {
  animation: fadeIn var(--motion-normal) var(--ease-out);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.slide-down {
  animation: slideDown var(--motion-normal) var(--ease-out);
}
@keyframes slideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.scale-up {
  animation: scaleUp var(--motion-normal) var(--ease-out);
}
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
```

## Reglas

1. NUNCA animar `all` → especificar propiedad: `transition: opacity 150ms`
2. Animacion proposito-especifica: fade para visibilidad, slide para posicion, scale para atencion
3. Maximo 1 animacion simultanea por elemento (no combinar fade+slide+scale)
4. Stagger delay para listas: 50ms entre items al aparecer
5. Prefers-reduced-motion siempre incluido
6. NUNCA animaciones de layout (ancho, alto, grid-area)
