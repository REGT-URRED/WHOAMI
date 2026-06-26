---
name: a11y-components
description: >
  Garantiza que todo componente frontend cumpla con WAI-ARIA, keyboard
  navigation, focus management, color contrast, screen reader support,
  y touch targets. Basado en Radix UI primitives y WCAG 2.1 AA.
origin: radix-ui/primitives + chakra-ui + WCAG 2.1
---

# A11Y Components — Accesibilidad First

Cada componente generado DEBE cumplir con estos requisitos de accesibilidad.

## Requisitos Globales

- **Roles semanticos**: `<button>` para acciones, `<nav>` para navegacion, `<main>` para contenido principal
- **Keyboard navigation**: Tab ordenado, Enter/Space para activar, Escape para cerrar, Arrow keys para navegar listas/tabs
- **Focus management**: focus visible en todos los interactive elements. Trap focus en modales. Restore focus al cerrar
- **ARIA attributes**: aria-label, aria-expanded, aria-haspopup, aria-describedby, aria-invalid, aria-required
- **Screen reader**: texto descriptivo en iconos (aria-label), live regions (aria-live) para updates dinamicos
- **Color contrast**: ratio 4.5:1 minimo (AA), preferible 7:1 (AAA). Verificar con tool
- **Touch targets**: 44x44px minimo en dispositivos táctiles
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` para animaciones
- **Language**: `<html lang="es">` correcto. lang attribute en cambios de idioma

## Patrones Obligatorios por Componente

### Dropdown Menu
```
<button aria-haspopup="true" aria-expanded={isOpen}>
  Menu
</button>
{isOpen && (
  <ul role="menu" aria-activedescendant={activeItem}>
    <li role="menuitem" tabIndex={-1}>Option 1</li>
    <li role="menuitem" tabIndex={-1}>Option 2</li>
  </ul>
)}
Keyboard: Enter/Espacio abre. Escape cierra. Arrow keys navega. Enter selecciona.
```

### Modal / Dialog
```
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Title</h2>
  <button onClick={close} aria-label="Cerrar dialogo">X</button>
</div>
Keyboard: Escape cierra. Tab circula dentro del modal. Focus trap activo.
```

### Form Field
```
<div>
  <label htmlFor={id}>{label}{required && <span aria-hidden="true">*</span>}</label>
  <input
    id={id}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : undefined}
    aria-required={required}
  />
  {error && <p id={`${id}-error`} role="alert">{error}</p>}
</div>
```

### Data Table
```
<table role="grid">
  <caption>Descripcion de tabla para lectores de pantalla</caption>
  <thead>
    <tr>
      <th scope="col">Header</th>
      <th scope="col">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Label</th>
      <td>Value</td>
    </tr>
  </tbody>
</table>
```

### Tabs
```
<div role="tablist" aria-label="Navegacion de tabs">
  <button role="tab" aria-selected={active === 0} aria-controls="panel-0" id="tab-0">Tab 1</button>
  <button role="tab" aria-selected={active === 1} aria-controls="panel-1" id="tab-1">Tab 2</button>
</div>
<div role="tabpanel" id="panel-0" aria-labelledby="tab-0">
  Content 1
</div>
Keyboard: Arrow Left/Right cambia tab. Home/End va al primero/ultimo.
```

### Accordion
```
<h3>
  <button aria-expanded={isOpen} aria-controls="section-content" id="section-header">
    Section Title
  </button>
</h3>
<div id="section-content" role="region" aria-labelledby="section-header">
  Content
</div>
Keyboard: Enter/Espacio toggle. Arrow Up/Down entre secciones. Home/End.
```

### Toast / Notification
```
<div role="status" aria-live="polite" aria-atomic="true">
  Mensaje de notificacion
</div>
Para errores criticos: role="alert" en lugar de status.
```

### Loading / Spinner
```
<div role="status" aria-label="Cargando">
  <Spinner />
  <span class="sr-only">Cargando contenido...</span>
</div>
```

## Checklist de Accesibilidad Pre-Entrega

- [ ] Todos los botones/links tienen texto descriptivo o aria-label
- [ ] Todos los formularios tienen labels asociados (htmlFor/id)
- [ ] Todos los modales tienen focus trap + Escape handler
- [ ] Todas las imagenes tienen alt text
- [ ] Color contrast ratio >= 4.5:1
- [ ] Touch targets >= 44x44px
- [ ] Tab order es logico (no tabIndex > 0 innecesario)
- [ ] No hay elementos ocultos que screen reader pueda alcanzar
- [ ] Live regions para contenido dinamico (aria-live)
- [ ] Skip navigation link presente en paginas
- [ ] prefers-reduced-motion soportado
- [ ] lang attribute correcto en <html>
